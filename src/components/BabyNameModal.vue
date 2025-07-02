<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">👶</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">
          ¡Bienvenido a BabyTrack!
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          ¿Cómo se llama tu bebé?
        </p>
      </div>

      <div class="mb-6">
        <input
          v-model="name"
          type="text"
          placeholder="Nombre del bebé"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          @keyup.enter="handleSave"
          ref="nameInput"
        />
      </div>

      <button
        @click="handleSave"
        :disabled="!name.trim()"
        class="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  save: [name: string];
}>();

const name = ref('');
const nameInput = ref<HTMLInputElement>();

const handleSave = () => {
  if (name.value.trim()) {
    emit('save', name.value.trim());
  }
};

// Watch for modal opening to focus input
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      nameInput.value?.focus();
    });
  }
});
</script>