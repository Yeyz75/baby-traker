import { ref, onMounted } from 'vue';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export function useAuth() {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref('');

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      error.value = '';
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión con Google';
      throw err;
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      error.value = '';
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      error.value = err.message || 'Error al registrarse';
      throw err;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      error.value = '';
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión';
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      error.value = err.message || 'Error al cerrar sesión';
    }
  };

  // Initialize auth state listener
  onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
      loading.value = false;
    });
  });

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout
  };
}