<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-6">
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
      <span class="mr-2">📊</span>
      Resumen del día
    </h3>

    <!-- Event counters -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="text-center p-3 bg-baby-blue dark:bg-blue-900 rounded-xl">
        <div class="text-2xl mb-1">🍼</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ summary.feed }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300">Comidas</div>
      </div>
      <div class="text-center p-3 bg-baby-yellow dark:bg-yellow-900 rounded-xl">
        <div class="text-2xl mb-1">💩</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ summary.diaper }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300">Pañales</div>
      </div>
      <div class="text-center p-3 bg-baby-green dark:bg-green-900 rounded-xl">
        <div class="text-2xl mb-1">🛌</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ summary.sleep }}</div>
        <div class="text-xs text-gray-600 dark:text-gray-300">Sueños</div>
      </div>
    </div>

    <!-- Hourly chart -->
    <div v-if="hasEvents">
      <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Actividad por hora
      </h4>
      <div class="h-32">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  summary: {
    feed: number;
    diaper: number;
    sleep: number;
  };
  hourlyDistribution: number[];
}

const props = defineProps<Props>();

const hasEvents = computed(() => {
  return props.summary.feed + props.summary.diaper + props.summary.sleep > 0;
});

const chartData = computed(() => ({
  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  datasets: [
    {
      label: 'Eventos',
      data: props.hourlyDistribution,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 4
    }
  ]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: (context: any) => `${context[0].label}`,
        label: (context: any) => `${context.parsed.y} evento${context.parsed.y !== 1 ? 's' : ''}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        maxTicksLimit: 6
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        stepSize: 1
      }
    }
  }
}));
</script>