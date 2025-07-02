<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mt-6">
    <h3
      class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center"
    >
      <span class="mr-2">📊</span>
      Resumen del día
    </h3>

    <!-- Event counters -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="text-center p-3 bg-baby-blue dark:bg-blue-900 rounded-xl">
        <div class="text-2xl mb-1">🍼</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ summary.feed }}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-300">Comidas</div>
      </div>
      <div class="text-center p-3 bg-baby-yellow dark:bg-yellow-900 rounded-xl">
        <div class="text-2xl mb-1">💩</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ summary.diaper }}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-300">Pañales</div>
      </div>
      <div class="text-center p-3 bg-baby-green dark:bg-green-900 rounded-xl">
        <div class="text-2xl mb-1">🛌</div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ summary.sleep }}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-300">Sueños</div>
      </div>
    </div>

    <!-- Custom habits summary -->
    <div v-if="customHabitsSummary.length > 0" class="mb-6">
      <h4 class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Hábitos personalizados
      </h4>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="habit in customHabitsSummary"
          :key="habit.id"
          class="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
        >
          <div class="text-xl mb-1">{{ habit.emoji }}</div>
          <div class="text-lg font-bold text-gray-800 dark:text-white">
            {{ habit.count }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-300">
            {{ habit.name }}
          </div>
        </div>
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
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { CustomHabit } from "../types/BabyEvent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  summary: {
    feed: number;
    diaper: number;
    sleep: number;
  };
  hourlyDistribution: number[];
  events?: any[];
  customHabits?: CustomHabit[];
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  customHabits: () => [],
});

const hasEvents = computed(() => {
  return props.summary.feed + props.summary.diaper + props.summary.sleep > 0;
});

const customHabitsSummary = computed(() => {
  if (!props.events || !props.customHabits) return [];

  const habitCounts: Record<
    string,
    { id: string; name: string; emoji: string; count: number }
  > = {};

  props.events.forEach((event) => {
    const customHabit = props.customHabits.find((h) => h.id === event.type);
    if (customHabit) {
      if (!habitCounts[customHabit.id]) {
        habitCounts[customHabit.id] = {
          id: customHabit.id,
          name: customHabit.name,
          emoji: customHabit.emoji,
          count: 0,
        };
      }
      habitCounts[customHabit.id].count++;
    }
  });

  return Object.values(habitCounts);
});

const chartData = computed(() => ({
  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  datasets: [
    {
      label: "Eventos",
      data: props.hourlyDistribution,
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        title: (context: any) => `${context[0].label}`,
        label: (context: any) =>
          `${context.parsed.y} evento${context.parsed.y !== 1 ? "s" : ""}`,
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        maxTicksLimit: 6,
      },
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      ticks: {
        stepSize: 1,
      },
    },
  },
}));
</script>
