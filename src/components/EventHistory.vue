<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
      <span class="mr-2">📋</span>
      {{ babyName ? `Actividades de hoy de ${babyName}` : 'Actividades de hoy' }}
    </h2>
    
    <div v-if="loading" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      Cargando...
    </div>
    
    <div v-else-if="events.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <div class="text-3xl mb-2">👶</div>
      <p>Aún no hay actividades registradas hoy</p>
    </div>
    
    <div v-else class="space-y-3">
      <div
        v-for="(event, index) in events"
        :key="event.id"
        class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group"
      >
        <div class="text-2xl mr-3">{{ getEventIcon(event.type) }}</div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-800 dark:text-white">{{ getEventLabel(event.type) }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatTime(event.timestamp) }}</span>
          </div>
          <p v-if="event.note" class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ event.note }}</p>
        </div>
        
        <!-- Edit/Delete buttons for recent events (last 5) -->
        <div v-if="index < 5" class="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="handleEdit(event)"
            class="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            @click="handleDelete(event)"
            class="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BabyEvent } from '../types/BabyEvent';
import type { CustomHabit } from '../types/BabyEvent';

interface Props {
  events: BabyEvent[];
  loading: boolean;
  babyName: string;
  customHabits: CustomHabit[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [event: BabyEvent];
  delete: [event: BabyEvent];
}>();

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

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleEdit = (event: BabyEvent) => {
  emit('edit', event);
};

const handleDelete = (event: BabyEvent) => {
  if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
    emit('delete', event);
  }
};
</script>