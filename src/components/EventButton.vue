<template>
  <button
    @click="handleClick"
    class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 text-center border-2 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 active:scale-95"
    :class="buttonColors[type] || 'hover:bg-gray-50 dark:hover:bg-gray-700'"
  >
    <div class="text-4xl mb-2">{{ customIcon || icons[type] || '❓' }}</div>
    <div class="text-lg font-semibold text-gray-800 dark:text-white">
      {{ customLabel || labels[type] || type }}
    </div>
  </button>
</template>

<script setup lang="ts">
import type { BabyEvent } from '../types/BabyEvent';

interface Props {
  type: BabyEvent['type'];
  customLabel?: string;
  customIcon?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [type: BabyEvent['type']];
}>();

const icons: Record<string, string> = {
  feed: '🍼',
  diaper: '💩',
  sleep: '🛌'
};

const labels: Record<string, string> = {
  feed: 'Tomó leche',
  diaper: 'Cambió pañal',
  sleep: 'Durmió'
};

const buttonColors: Record<string, string> = {
  feed: 'hover:bg-baby-blue dark:hover:bg-blue-900',
  diaper: 'hover:bg-baby-yellow dark:hover:bg-yellow-900',
  sleep: 'hover:bg-baby-green dark:hover:bg-green-900'
};

const handleClick = () => {
  emit('click', props.type);
};
</script>