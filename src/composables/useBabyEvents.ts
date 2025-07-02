import { ref, computed, watch, onMounted } from "vue";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import type { BabyEvent } from "../types/BabyEvent";

interface BabyEventFirestore {
  type: BabyEvent["type"];
  timestamp: Timestamp;
  note: string;
  userId: string;
}

export function useBabyEvents() {
  const { user } = useAuth();
  const events = ref<BabyEvent[]>([]);
  const loading = ref(false);
  const error = ref("");
  let unsubscribe: (() => void) | null = null;

  const getUserId = (): string => {
    let userId = localStorage.getItem("babytrack-user-id");
    if (!userId) {
      userId =
        "anonymous-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substr(2, 9);
      localStorage.setItem("babytrack-user-id", userId);
    }
    return userId;
  };

  // Add new event
  const addEvent = async (type: BabyEvent["type"], note?: string) => {
    try {
      const userId = getUserId();
      const collectionPath = user.value
        ? `users/${user.value.uid}/events`
        : "babyEvents";

      await addDoc(collection(db, collectionPath), {
        type,
        timestamp: Timestamp.now(),
        note: note || "",
        userId,
      });
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  };

  // Update event
  const updateEvent = async (
    eventId: string,
    type: BabyEvent["type"],
    note?: string
  ) => {
    try {
      const collectionPath = user.value
        ? `users/${user.value.uid}/events`
        : "babyEvents";
      const eventRef = doc(db, collectionPath, eventId);
      await updateDoc(eventRef, {
        type,
        note: note || "",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      const collectionPath = user.value
        ? `users/${user.value.uid}/events`
        : "babyEvents";
      await deleteDoc(doc(db, collectionPath, eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  // Get today's date range
  const getTodayRange = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    return { startOfDay, endOfDay };
  };

  // Daily summary computed property
  const dailySummary = computed(() => {
    const summary = {
      feed: 0,
      diaper: 0,
      sleep: 0,
    };

    events.value.forEach((event) => {
      if (summary[event.type as keyof typeof summary] !== undefined) {
        summary[event.type as keyof typeof summary]++;
      }
    });

    return summary;
  });

  // Hourly distribution for chart
  const hourlyDistribution = computed(() => {
    const hours = Array(24).fill(0);

    events.value.forEach((event) => {
      const hour = event.timestamp.getHours();
      hours[hour]++;
    });

    return hours;
  });

  // Migrate local events to user collection when signing in
  const migrateLocalEvents = async () => {
    if (!user.value) return;

    try {
      // Get anonymous user events
      const anonymousUserId = localStorage.getItem("babytrack-user-id");
      if (!anonymousUserId) return;

      const { startOfDay, endOfDay } = getTodayRange();

      const q = query(
        collection(db, "babyEvents"),
        where("userId", "==", anonymousUserId),
        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
        where("timestamp", "<=", Timestamp.fromDate(endOfDay))
      );

      const snapshot = await new Promise((resolve) => {
        const unsubscribe = onSnapshot(q, (snap) => {
          unsubscribe();
          resolve(snap);
        });
      });

      // Migrate events to user collection
      for (const docSnap of (snapshot as any).docs) {
        const data = docSnap.data();
        await addDoc(collection(db, `users/${user.value.uid}/events`), {
          ...data,
          userId: user.value.uid,
        });
        // Delete from anonymous collection
        await deleteDoc(docSnap.ref);
      }
    } catch (error) {
      console.error("Error migrating events:", error);
    }
  };

  // Load events for today
  const loadTodayEvents = () => {
    const userId = getUserId();
    const { startOfDay, endOfDay } = getTodayRange();
    const collectionPath = user.value
      ? `users/${user.value.uid}/events`
      : "babyEvents";

    // Set loading to true at the start
    loading.value = true;
    error.value = "";

    // Cancelar listener anterior si existe
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    const q = query(
      collection(db, collectionPath),
      where("userId", "==", userId),
      where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
      where("timestamp", "<=", Timestamp.fromDate(endOfDay)),
      orderBy("timestamp", "desc")
    );

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        events.value = snapshot.docs.map((doc) => {
          const data = doc.data() as BabyEventFirestore;
          return {
            id: doc.id,
            type: data.type,
            timestamp: data.timestamp.toDate(),
            note: data.note,
            userId: data.userId,
          } as BabyEvent;
        });
        loading.value = false;
        error.value = "";
      },
      (firestoreError) => {
        console.error("Error loading events:", firestoreError);
        loading.value = false;
        error.value =
          "Error al cargar las actividades. Verifica tu conexión a internet.";
        // Set empty array on error to prevent infinite loading
        events.value = [];
        // En caso de error de permisos, limpiar los eventos
        if (firestoreError.code === "permission-denied") {
          events.value = [];
        }
      }
    );
  };

  // Cleanup function to unsubscribe from listeners
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  // Watch for user changes to handle authentication state
  watch(user, (newUser, oldUser) => {
    // Si el usuario cerró sesión, limpiar listeners y datos
    if (oldUser && !newUser) {
      cleanup();
      events.value = [];
    }
    // Si el usuario inició sesión, migrar datos y cargar eventos
    else if (newUser && !oldUser) {
      migrateLocalEvents();
    }
    // Recargar eventos cuando cambia el usuario
    loadTodayEvents();
  });

  onMounted(() => {
    loadTodayEvents();
  });

  return {
    events,
    loading,
    error,
    dailySummary,
    hourlyDistribution,
    addEvent,
    updateEvent,
    deleteEvent,
    migrateLocalEvents,
    cleanup,
  };
}
