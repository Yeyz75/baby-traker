<template>
  <div class="min-h-screen bg-gradient-to-br from-baby-pink via-baby-blue to-baby-green dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
    <!-- Header -->
    <header class="text-center py-8 px-4">
      <div class="flex justify-between items-center max-w-md mx-auto mb-4">
        <UserProfile />
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">
          👶 BabyTrack
        </h1>
        <DarkModeToggle />
      </div>
      <p class="text-gray-600 dark:text-gray-300">
        {{ babyName ? `Registra los hábitos de ${babyName}` : 'Registra los hábitos de tu bebé' }}
      </p>
    </header>

    <!-- Main Content -->
    <main class="px-4 pb-24">
      <!-- Action Buttons -->
      <div class="grid grid-cols-1 gap-4 mb-8 max-w-md mx-auto">
        <!-- Default event buttons -->
        <EventButton
          v-for="eventType in eventTypes"
          :key="eventType"
          :type="eventType"
          @click="handleEventClick"
        />
        
        <!-- Custom habit buttons -->
        <EventButton
          v-for="habit in customHabits"
          :key="habit.id"
          :type="habit.id"
          :custom-label="habit.name"
          :custom-icon="habit.emoji"
          @click="handleEventClick"
        />
        
        <!-- Add custom habit button -->
        <button
          @click="handleAddCustomHabit"
          class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95"
        >
          <div class="text-4xl mb-2">➕</div>
          <div class="text-lg font-semibold text-gray-600 dark:text-gray-400">Agregar hábito</div>
        </button>
      </div>

      <!-- History -->
      <div class="max-w-2xl mx-auto">
        <EventHistory 
          :events="events" 
          :loading="loading" 
          :baby-name="babyName"
          :custom-habits="customHabits"
          @edit="handleEditEvent"
          @delete="handleDeleteEvent"
        />

        <!-- Daily Summary -->
        <DailySummary 
          v-if="events.length > 0"
          :summary="dailySummary"
          :hourly-distribution="hourlyDistribution"
        />
      </div>
    </main>

    <!-- Coffee Button -->
    <CoffeeButton />

    <!-- Event Modal -->
    <EventModal
      :is-open="eventModal.isOpen"
      :event-type="eventModal.eventType"
      :is-editing="eventModal.isEditing"
      :initial-note="eventModal.initialNote"
      :custom-habits="customHabits"
      @close="closeEventModal"
      @save="handleEventSave"
    />

    <!-- Baby Name Modal -->
    <BabyNameModal
      :is-open="showBabyNameModal"
      @save="handleBabyNameSave"
    />

    <!-- Custom Habit Modal -->
    <CustomHabitModal
      :is-open="customHabitModal.isOpen"
      :is-editing="customHabitModal.isEditing"
      :initial-name="customHabitModal.initialName"
      :initial-emoji="customHabitModal.initialEmoji"
      @close="closeCustomHabitModal"
      @save="handleCustomHabitSave"
    />

    <!-- Auth Modal for habit limit -->
    <AuthModal
      :is-open="showAuthModal"
      mode="limit"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />

    <!-- Success Toast -->
    <div
      v-if="showToast"
      class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useBabyEvents } from './composables/useBabyEvents';
import { useBabyName } from './composables/useBabyName';
import { useCustomHabits } from './composables/useCustomHabits';
import { useAuth } from './composables/useAuth';
import EventButton from './components/EventButton.vue';
import EventHistory from './components/EventHistory.vue';
import DailySummary from './components/DailySummary.vue';
import CoffeeButton from './components/CoffeeButton.vue';
import EventModal from './components/EventModal.vue';
import BabyNameModal from './components/BabyNameModal.vue';
import CustomHabitModal from './components/CustomHabitModal.vue';
import AuthModal from './components/AuthModal.vue';
import DarkModeToggle from './components/DarkModeToggle.vue';
import UserProfile from './components/UserProfile.vue';
import type { BabyEvent } from './types/BabyEvent';

const { user } = useAuth();
const { events, loading, dailySummary, hourlyDistribution, addEvent, updateEvent, deleteEvent } = useBabyEvents();
const { babyName, setBabyName } = useBabyName();
const { 
  habits: customHabits, 
  canAddHabit, 
  addCustomHabit, 
  updateCustomHabit, 
  deleteCustomHabit,
  initializeHabits 
} = useCustomHabits();

const eventTypes: BabyEvent['type'][] = ['feed', 'diaper', 'sleep'];
const showBabyNameModal = ref(false);
const showAuthModal = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// Event modal state
const eventModal = ref({
  isOpen: false,
  eventType: 'feed' as BabyEvent['type'],
  isEditing: false,
  initialNote: '',
  editingEventId: ''
});

// Custom habit modal state
const customHabitModal = ref({
  isOpen: false,
  isEditing: false,
  initialName: '',
  initialEmoji: '',
  editingHabitId: ''
});

const handleEventClick = (type: BabyEvent['type']) => {
  eventModal.value = {
    isOpen: true,
    eventType: type,
    isEditing: false,
    initialNote: '',
    editingEventId: ''
  };
};

const handleEditEvent = (event: BabyEvent) => {
  eventModal.value = {
    isOpen: true,
    eventType: event.type,
    isEditing: true,
    initialNote: event.note || '',
    editingEventId: event.id || ''
  };
};

const handleDeleteEvent = async (event: BabyEvent) => {
  if (event.id) {
    await deleteEvent(event.id);
    showToastMessage('Actividad eliminada');
  }
};

const closeEventModal = () => {
  eventModal.value.isOpen = false;
};

const handleEventSave = async (note: string) => {
  try {
    if (eventModal.value.isEditing && eventModal.value.editingEventId) {
      await updateEvent(eventModal.value.editingEventId, eventModal.value.eventType, note);
      showToastMessage('Actividad actualizada');
    } else {
      await addEvent(eventModal.value.eventType, note);
      showToastMessage('Actividad registrada');
    }
    closeEventModal();
  } catch (error) {
    console.error('Error saving event:', error);
  }
};

const handleBabyNameSave = (name: string) => {
  setBabyName(name);
  showBabyNameModal.value = false;
  showToastMessage(`¡Bienvenido ${name}!`);
};

const handleAddCustomHabit = () => {
  if (!canAddHabit.value) {
    showAuthModal.value = true;
    return;
  }
  
  customHabitModal.value = {
    isOpen: true,
    isEditing: false,
    initialName: '',
    initialEmoji: '',
    editingHabitId: ''
  };
};

const closeCustomHabitModal = () => {
  customHabitModal.value.isOpen = false;
};

const handleCustomHabitSave = async (name: string, emoji: string) => {
  try {
    if (customHabitModal.value.isEditing && customHabitModal.value.editingHabitId) {
      await updateCustomHabit(customHabitModal.value.editingHabitId, name, emoji);
      showToastMessage('Hábito actualizado');
    } else {
      await addCustomHabit(name, emoji);
      showToastMessage('¡Hábito creado!');
    }
    closeCustomHabitModal();
  } catch (error) {
    console.error('Error saving custom habit:', error);
  }
};

const handleAuthSuccess = () => {
  showAuthModal.value = false;
  showToastMessage('¡Sesión iniciada correctamente!');
  // After successful auth, user can now add more habits
  setTimeout(() => {
    handleAddCustomHabit();
  }, 1000);
};

const showToastMessage = (message: string) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// Watch for user changes to initialize habits
watch(user, () => {
  initializeHabits();
}, { immediate: true });

onMounted(() => {
  // Show baby name modal if no name is set
  if (!babyName.value) {
    showBabyNameModal.value = true;
  }
  
  // Initialize habits
  initializeHabits();
});
</script>