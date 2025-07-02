<template>
  <button
    @click="toggleDarkMode"
    class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
  >
    <span class="text-lg">{{ isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<script setup lang="ts">
import { useDarkMode } from '../composables/useDarkMode';

const { isDark, toggleDarkMode } = useDarkMode();
</script>