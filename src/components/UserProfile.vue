<template>
  <div class="flex items-center gap-3">
    <!-- User info or login button -->
    <div v-if="user" class="relative">
      <!-- User avatar and name -->
      <button
        @click="toggleMenu"
        class="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
      >
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || 'Usuario'"
          class="w-8 h-8 rounded-full"
        />
        <div
          v-else
          class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
        >
          {{ (user.displayName || user.email || "U").charAt(0).toUpperCase() }}
        </div>
        <span class="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
          {{ user.displayName || user.email }}
        </span>
        <svg
          class="w-4 h-4 text-gray-500 transition-transform"
          :class="{ 'rotate-180': isMenuOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="isMenuOpen"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
      >
        <div class="py-2">
          <!-- User info section -->
          <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ user.displayName || "Usuario" }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ user.email }}
            </p>
          </div>

          <!-- Menu items -->
          <button
            @click="handleProfile"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Mi Perfil
          </button>

          <button
            @click="handleSettings"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Configuración
          </button>

          <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>

          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
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
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "../composables/useAuth";
import { useCustomHabits } from "../composables/useCustomHabits";
import { useBabyEvents } from "../composables/useBabyEvents";
import AuthModal from "./AuthModal.vue";

const { user, logout } = useAuth();
const { migrateLocalHabits } = useCustomHabits();
const { migrateLocalEvents } = useBabyEvents();

const showAuthModal = ref(false);
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLogout = async () => {
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    await logout();
    closeMenu();
  }
};

const handleProfile = () => {
  // TODO: Implementar vista de perfil
  alert("Función de perfil en desarrollo");
  closeMenu();
};

const handleSettings = () => {
  // TODO: Implementar configuración
  alert("Función de configuración en desarrollo");
  closeMenu();
};

const handleAuthSuccess = async () => {
  showAuthModal.value = false;
  // Migrate local data when user signs in
  await migrateLocalHabits();
  await migrateLocalEvents();
};

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest(".relative")) {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
