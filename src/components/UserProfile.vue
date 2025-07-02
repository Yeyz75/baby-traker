<template>
  <div class="flex items-center gap-3">
    <!-- User info or login button -->
    <div v-if="user" class="flex items-center gap-2">
      <img
        v-if="user.photoURL"
        :src="user.photoURL"
        :alt="user.displayName || 'Usuario'"
        class="w-8 h-8 rounded-full"
      />
      <div v-else class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
        {{ (user.displayName || user.email || 'U').charAt(0).toUpperCase() }}
      </div>
      <span class="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
        {{ user.displayName || user.email }}
      </span>
      <button
        @click="handleLogout"
        class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        title="Cerrar sesión"
      >
        🚪
      </button>
    </div>
    
    <button
      v-else
      @click="showAuthModal = true"
      class="text-sm px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Iniciar sesión
    </button>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useCustomHabits } from '../composables/useCustomHabits';
import { useBabyEvents } from '../composables/useBabyEvents';
import AuthModal from './AuthModal.vue';

const { user, logout } = useAuth();
const { migrateLocalHabits } = useCustomHabits();
const { migrateLocalEvents } = useBabyEvents();

const showAuthModal = ref(false);

const handleLogout = async () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    await logout();
  }
};

const handleAuthSuccess = async () => {
  showAuthModal.value = false;
  // Migrate local data when user signs in
  await migrateLocalHabits();
  await migrateLocalEvents();
};
</script>