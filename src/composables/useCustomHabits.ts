import { ref, computed } from 'vue';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';
import type { CustomHabit, CustomHabitFirestore } from '../types/BabyEvent';

export function useCustomHabits() {
  const { user } = useAuth();
  const habits = ref<CustomHabit[]>([]);
  const loading = ref(false);

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

  // Load habits from localStorage for anonymous users
  const loadLocalHabits = () => {
    const stored = localStorage.getItem('babytrack-custom-habits');
    if (stored) {
      try {
        const localHabits = JSON.parse(stored);
        habits.value = localHabits.map((habit: any) => ({
          ...habit,
          userId: getUserId()
        }));
      } catch (error) {
        console.error('Error loading local habits:', error);
      }
    }
  };

  // Save habits to localStorage for anonymous users
  const saveLocalHabits = () => {
    if (!user.value) {
      localStorage.setItem('babytrack-custom-habits', JSON.stringify(habits.value));
    }
  };

  // Load habits from Firestore for authenticated users
  const loadFirestoreHabits = () => {
    if (!user.value) return;

    const q = query(
      collection(db, 'customHabits'),
      where('userId', '==', user.value.uid)
    );

    onSnapshot(q, (snapshot) => {
      habits.value = snapshot.docs.map(doc => {
        const data = doc.data() as CustomHabitFirestore;
        return {
          id: doc.id,
          name: data.name,
          emoji: data.emoji,
          userId: data.userId
        } as CustomHabit;
      });
    });
  };

  // Add new custom habit
  const addCustomHabit = async (name: string, emoji: string) => {
    try {
      const userId = getUserId();
      
      if (user.value) {
        // Save to Firestore for authenticated users
        await addDoc(collection(db, 'customHabits'), {
          name,
          emoji,
          userId: user.value.uid
        });
      } else {
        // Save to localStorage for anonymous users
        const newHabit: CustomHabit = {
          id: 'habit-' + Date.now(),
          name,
          emoji,
          userId
        };
        habits.value.push(newHabit);
        saveLocalHabits();
      }
    } catch (error) {
      console.error('Error adding custom habit:', error);
      throw error;
    }
  };

  // Update custom habit
  const updateCustomHabit = async (habitId: string, name: string, emoji: string) => {
    try {
      if (user.value) {
        // Update in Firestore
        const habitRef = doc(db, 'customHabits', habitId);
        await updateDoc(habitRef, { name, emoji });
      } else {
        // Update in localStorage
        const index = habits.value.findIndex(h => h.id === habitId);
        if (index !== -1) {
          habits.value[index] = { ...habits.value[index], name, emoji };
          saveLocalHabits();
        }
      }
    } catch (error) {
      console.error('Error updating custom habit:', error);
      throw error;
    }
  };

  // Delete custom habit
  const deleteCustomHabit = async (habitId: string) => {
    try {
      if (user.value) {
        // Delete from Firestore
        await deleteDoc(doc(db, 'customHabits', habitId));
      } else {
        // Delete from localStorage
        habits.value = habits.value.filter(h => h.id !== habitId);
        saveLocalHabits();
      }
    } catch (error) {
      console.error('Error deleting custom habit:', error);
      throw error;
    }
  };

  // Migrate local habits to Firestore when user signs in
  const migrateLocalHabits = async () => {
    if (!user.value) return;

    const localHabits = localStorage.getItem('babytrack-custom-habits');
    if (localHabits) {
      try {
        const habitsToMigrate = JSON.parse(localHabits);
        for (const habit of habitsToMigrate) {
          await addDoc(collection(db, 'customHabits'), {
            name: habit.name,
            emoji: habit.emoji,
            userId: user.value.uid
          });
        }
        // Clear local storage after migration
        localStorage.removeItem('babytrack-custom-habits');
      } catch (error) {
        console.error('Error migrating local habits:', error);
      }
    }
  };

  // Check if user can add more habits (limit for anonymous users)
  const canAddHabit = computed(() => {
    if (user.value) return true; // Authenticated users have no limit
    return habits.value.length < 1; // Anonymous users limited to 1 habit
  });

  // Initialize habits loading
  const initializeHabits = () => {
    if (user.value) {
      loadFirestoreHabits();
    } else {
      loadLocalHabits();
    }
  };

  return {
    habits,
    loading,
    canAddHabit,
    addCustomHabit,
    updateCustomHabit,
    deleteCustomHabit,
    migrateLocalHabits,
    initializeHabits
  };
}