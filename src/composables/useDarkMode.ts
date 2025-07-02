import { ref, watch } from 'vue';

export function useDarkMode() {
  const isDark = ref(false);

  // Initialize from localStorage or system preference
  const initDarkMode = () => {
    const stored = localStorage.getItem('babytrack-dark-mode');
    if (stored !== null) {
      isDark.value = JSON.parse(stored);
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateDarkMode();
  };

  // Update DOM and localStorage
  const updateDarkMode = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('babytrack-dark-mode', JSON.stringify(isDark.value));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    updateDarkMode();
  };

  // Watch for changes
  watch(isDark, updateDarkMode);

  // Initialize on composable creation
  initDarkMode();

  return {
    isDark,
    toggleDarkMode
  };
}