export interface BabyEvent {
  id?: string;
  type: 'feed' | 'diaper' | 'sleep' | string; // Allow custom habit types
  timestamp: Date;
  note?: string;
  userId: string;
}

export interface BabyEventFirestore {
  type: 'feed' | 'diaper' | 'sleep' | string;
  timestamp: any; // Firestore Timestamp
  note?: string;
  userId: string;
}

export interface CustomHabit {
  id: string;
  name: string;
  emoji: string;
  userId: string;
}

export interface CustomHabitFirestore {
  name: string;
  emoji: string;
  userId: string;
}