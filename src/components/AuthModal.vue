<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔐</div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {{ mode === 'limit' ? 'Límite alcanzado' : 'Iniciar sesión' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
          {{ mode === 'limit' 
            ? 'Solo puedes tener 1 hábito adicional sin iniciar sesión. Inicia sesión para guardar más hábitos y acceder desde cualquier dispositivo.'
            : 'Inicia sesión para sincronizar tus datos en todos tus dispositivos'
          }}
        </p>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
        {{ error }}
      </div>

      <!-- Success message -->
      <div v-if="success" class="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
        {{ success }}
      </div>

      <!-- Auth form -->
      <div v-if="authMode === 'login' || authMode === 'register'" class="mb-6">
        <div class="space-y-4">
          <input
            v-model="email"
            type="email"
            placeholder="Correo electrónico"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @keyup.enter="handleEmailAuth"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="space-y-3">
        <!-- Google Sign In -->
        <button
          v-if="authMode === 'main'"
          @click="handleGoogleSignIn"
          :disabled="loading"
          class="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span class="mr-2">🔍</span>
          {{ loading ? 'Iniciando...' : 'Iniciar sesión con Google' }}
        </button>

        <!-- Email buttons -->
        <div v-if="authMode === 'main'" class="flex gap-3">
          <button
            @click="authMode = 'login'"
            class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Iniciar sesión
          </button>
          <button
            @click="authMode = 'register'"
            class="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
          >
            Registrarse
          </button>
        </div>

        <!-- Email auth submit -->
        <button
          v-if="authMode === 'login' || authMode === 'register'"
          @click="handleEmailAuth"
          :disabled="loading || !email || !password"
          class="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Procesando...' : (authMode === 'login' ? 'Iniciar sesión' : 'Registrarse') }}
        </button>

        <!-- Back button -->
        <button
          v-if="authMode !== 'main'"
          @click="authMode = 'main'"
          class="w-full px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Volver
        </button>

        <!-- Cancel -->
        <button
          v-if="authMode === 'main'"
          @click="handleClose"
          class="w-full px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';

interface Props {
  isOpen: boolean;
  mode?: 'auth' | 'limit';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'auth'
});

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

const authMode = ref<'main' | 'login' | 'register'>('main');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

const handleGoogleSignIn = async () => {
  try {
    loading.value = true;
    error.value = '';
    await signInWithGoogle();
    success.value = '¡Sesión iniciada correctamente!';
    setTimeout(() => {
      emit('success');
      handleClose();
    }, 1000);
  } catch (err) {
    error.value = 'Error al iniciar sesión con Google';
  } finally {
    loading.value = false;
  }
};

const handleEmailAuth = async () => {
  if (!email.value || !password.value) return;

  try {
    loading.value = true;
    error.value = '';
    
    if (authMode.value === 'login') {
      await signInWithEmail(email.value, password.value);
      success.value = '¡Sesión iniciada correctamente!';
    } else {
      await signUpWithEmail(email.value, password.value);
      success.value = '¡Cuenta creada correctamente!';
    }
    
    setTimeout(() => {
      emit('success');
      handleClose();
    }, 1000);
  } catch (err) {
    error.value = authMode.value === 'login' 
      ? 'Error al iniciar sesión. Verifica tus credenciales.'
      : 'Error al crear la cuenta. El correo puede estar en uso.';
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  authMode.value = 'main';
  email.value = '';
  password.value = '';
  error.value = '';
  success.value = '';
  loading.value = false;
  emit('close');
};

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    authMode.value = props.mode === 'limit' ? 'main' : 'main';
  } else {
    handleClose();
  }
});
</script>