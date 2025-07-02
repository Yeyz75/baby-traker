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
        <div class="text-4xl mb-2">✨</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white">
          {{ isEditing ? 'Editar hábito' : 'Crear hábito personalizado' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">
          Crea un hábito personalizado para tu bebé
        </p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
        {{ error }}
      </div>

      <div class="space-y-4 mb-6">
        <!-- Emoji picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ícono
          </label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="emoji in emojiOptions"
              :key="emoji"
              @click="selectedEmoji = emoji"
              :class="[
                'p-3 text-2xl rounded-lg border-2 transition-colors',
                selectedEmoji === emoji
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <!-- Name input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del hábito
          </label>
          <input
            v-model="habitName"
            type="text"
            placeholder="Ej: Tomó medicina, Jugó, etc."
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @keyup.enter="handleSave"
            ref="nameInput"
          />
        </div>
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
          :disabled="!habitName.trim() || !selectedEmoji || loading"
          class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

interface Props {
  isOpen: boolean;
  isEditing?: boolean;
  initialName?: string;
  initialEmoji?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  initialName: '',
  initialEmoji: ''
});

const emit = defineEmits<{
  close: [];
  save: [name: string, emoji: string];
}>();

const habitName = ref('');
const selectedEmoji = ref('');
const loading = ref(false);
const error = ref('');
const nameInput = ref<HTMLInputElement>();

const emojiOptions = [
  '💊', '🍎', '🥛', '🧸', '📚', '🎵',
  '🚗', '🎨', '⚽', '🌟', '🎪', '🦄',
  '🐻', '🌈', '🎁', '🏃', '🛁', '🧩',
  '📱', '🎯', '🍯', '🌸', '🎈', '⭐'
];

const handleBackdropClick = () => {
  emit('close');
};

const handleCancel = () => {
  emit('close');
};

const handleSave = async () => {
  if (!habitName.value.trim() || !selectedEmoji.value) return;

  try {
    loading.value = true;
    error.value = '';
    emit('save', habitName.value.trim(), selectedEmoji.value);
  } catch (err) {
    error.value = 'Error al guardar el hábito';
  } finally {
    loading.value = false;
  }
};

// Watch for modal opening to focus input and set initial values
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    habitName.value = props.initialName;
    selectedEmoji.value = props.initialEmoji || emojiOptions[0];
    nextTick(() => {
      nameInput.value?.focus();
    });
  } else {
    habitName.value = '';
    selectedEmoji.value = '';
    error.value = '';
    loading.value = false;
  }
});
</script>