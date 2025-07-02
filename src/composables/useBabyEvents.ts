import { ref, onMounted, computed, watch } from 'vue';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';
import type { BabyEvent, BabyEventFirestore } from '../types/BabyEvent';

export function useBabyEvents() {
  const { user } = useAuth();
  const events = ref<BabyEvent[]>([]);
  const loading = ref(true);

  // Get or create anonymous user ID
  const getUserId = (): string => {
    if (user.value) {
      return user.value.uid;
    }
    let userId = localStorage.getItem('babytrack-user-id');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('babytrack-user-id', userId);
    }
    return userId;
  };

  // Add new event
  const addEvent = async (type: BabyEvent['type'], note?: string) => {
    try {
      const userId = getUserId();
      const collectionPath = user.value ? `users/${user.value.uid}/events` : 'babyEvents';
      
      await addDoc(collection(db, collectionPath), {
        type,
        timestamp: Timestamp.now(),
        note: note || '',
        userId
      });
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  // Update event
  const updateEvent = async (eventId: string, type: BabyEvent['type'], note?: string) => {
    try {
      const collectionPath = user.value ? `users/${user.value.uid}/events` : 'babyEvents';
      const eventRef = doc(db, collectionPath, eventId);
      await updateDoc(eventRef, {
        type,
        note: note || ''
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    try {
      const collectionPath = user.value ? `users/${user.value.uid}/events` : 'babyEvents';
      await deleteDoc(doc(db, collectionPath, eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
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
    const summary: Record<string, number> = {
      feed: 0,
      diaper: 0,
      sleep: 0
    };

    events.value.forEach(event => {
      if (summary[event.type] !== undefined) {
        summary[event.type]++;
      } else {
        summary[event.type] = (summary[event.type] || 0) + 1;
      }
    });

    return summary;
  });

  // Hourly distribution for chart
  const hourlyDistribution = computed(() => {
    const hours = Array(24).fill(0);
    
    events.value.forEach(event => {
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
      const anonymousUserId = localStorage.getItem('babytrack-user-id');
      if (!anonymousUserId) return;

      const { startOfDay, endOfDay } = getTodayRange();
      
      const q = query(
        collection(db, 'babyEvents'),
        where('userId', '==', anonymousUserId),
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<=', Timestamp.fromDate(endOfDay))
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
          userId: user.value.uid
        });
        // Delete from anonymous collection
        await deleteDoc(docSnap.ref);
      }
    } catch (error) {
      console.error('Error migrating events:', error);
    }
  };

  // Load events for today
  const loadTodayEvents = () => {
    const userId = getUserId();
    const { startOfDay, endOfDay } = getTodayRange();
    const collectionPath = user.value ? `users/${user.value.uid}/events` : 'babyEvents';

    const q = query(
      collection(db, collectionPath),
      where('userId', '==', userId),
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'desc')
    );

    onSnapshot(q, (snapshot) => {
      events.value = snapshot.docs.map(doc => {
        const data = doc.data() as BabyEventFirestore;
        return {
          id: doc.id,
          type: data.type,
          timestamp: data.timestamp.toDate(),
          note: data.note,
          userId: data.userId
        } as BabyEvent;
      });
      loading.value = false;
    });
  };

  // Watch for user changes to reload events
  watch(user, (newUser) => {
    if (newUser) {
      migrateLocalEvents();
    }
    loadTodayEvents();
  }, { immediate: false });

  onMounted(() => {
    loadTodayEvents();
  });

  return {
    events,
    loading,
    dailySummary,
    hourlyDistribution,
    addEvent,
    updateEvent,
    deleteEvent,
    migrateLocalEvents
  };
}