<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      @click.stop
    >
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">{{ getEventIcon(eventType) }}</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ getEventLabel(eventType) }}
        </h3>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nota opcional
        </label>
        <input
          v-model="note"
          type="text"
          :placeholder="getPlaceholder(eventType)"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          @keyup.enter="handleSave"
          ref="noteInput"
        />
      </div>

      <div class="flex gap-3">
        <button
          @click="handleCancel"
          class="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { BabyEvent, CustomHabit } from '../types/BabyEvent';

interface Props {
  isOpen: boolean;
  eventType: BabyEvent['type'];
  isEditing?: boolean;
  initialNote?: string;
  customHabits: CustomHabit[];
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  initialNote: ''
});

const emit = defineEmits<{
  close: [];
  save: [note: string];
}>();

const note = ref('');
const noteInput = ref<HTMLInputElement>();

const getEventIcon = (type: BabyEvent['type']) => {
  const icons: Record<string, string> = {
    feed: '🍼',
    diaper: '💩',
    sleep: '🛌'
  };
  
  // Check if it's a custom habit
  const customHabit = props.customHabits.find(h => h.id === type);
  if (customHabit) {
    return customHabit.emoji;
  }
  
  return icons[type] || '❓';
};

const getEventLabel = (type: BabyEvent['type']) => {
  const labels: Record<string, string> = {
    feed: 'Tomó leche',
    diaper: 'Cambió pañal',
    sleep: 'Durmió'
  };
  
  // Check if it's a custom habit
  const customHabit = props.customHabits.find(h => h.id === type);
  if (customHabit) {
    return customHabit.name;
  }
  
  return labels[type] || type;
};

const getPlaceholder = (type: BabyEvent['type']) => {
  const placeholders: Record<string, string> = {
    feed: 'Ej: 120ml, pecho izquierdo...',
    diaper: 'Ej: solo pipí, muy sucio...',
    sleep: 'Ej: 2 horas, se durmió rápido...'
  };
  
  // Check if it's a custom habit
  const customHabit = props.customHabits.find(h => h.id === type);
  if (customHabit) {
    return `Ej: detalles sobre ${customHabit.name.toLowerCase()}...`;
  }
  
  return placeholders[type] || 'Agrega una nota...';
};

const handleBackdropClick = () => {
  emit('close');
};

const handleCancel = () => {
  emit('close');
};

const handleSave = () => {
  emit('save', note.value);
};

// Watch for modal opening to focus input and set initial note
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    note.value = props.initialNote;
    nextTick(() => {
      noteInput.value?.focus();
    });
  }
});
</script>