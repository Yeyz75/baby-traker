import { ref, onMounted } from "vue";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

export function useAuth() {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref("");

  // Create user document in Firestore
  const createUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName:
            user.displayName || user.email?.split("@")[0] || "Usuario",
          photoURL: user.photoURL || null,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
        console.log("Usuario creado en Firestore:", user.uid);
      } else {
        // Update last login
        await setDoc(
          userRef,
          {
            lastLogin: new Date(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      error.value = "";
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
      return result.user;
    } catch (err: any) {
      error.value = err.message || "Error al iniciar sesión con Google";
      throw err;
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      error.value = "";
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserDocument(result.user);
      return result.user;
    } catch (err: any) {
      error.value = err.message || "Error al registrarse";
      throw err;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      error.value = "";
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
      return result.user;
    } catch (err: any) {
      error.value = err.message || "Error al iniciar sesión";
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      // Limpiar datos locales antes de cerrar sesión
      localStorage.removeItem("babytrack-user-id");
      localStorage.removeItem("babytrack-custom-habits");

      // Cerrar sesión en Firebase
      await signOut(auth);

      // Limpiar estado local
      user.value = null;
      error.value = "";
    } catch (err: any) {
      console.error("Error durante el cierre de sesión:", err);
      error.value = err.message || "Error al cerrar sesión";
      // Aún así, limpiar el estado local
      user.value = null;
    }
  };

  // Initialize auth state listener
  onMounted(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser;
      if (firebaseUser) {
        // Update last login when user is already authenticated
        await createUserDocument(firebaseUser);
      }
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
    logout,
  };
}
