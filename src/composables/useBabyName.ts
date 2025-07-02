import { ref } from 'vue';

export function useBabyName() {
  const babyName = ref('');

  // Initialize baby name from localStorage
  const initBabyName = () => {
    const stored = localStorage.getItem('babytrack-baby-name');
    if (stored) {
      babyName.value = stored;
    }
  };

  // Set baby name
  const setBabyName = (name: string) => {
    babyName.value = name;
    localStorage.setItem('babytrack-baby-name', name);
  };

  // Initialize on composable creation
  initBabyName();

  return {
    babyName,
    setBabyName
  };
}