<script setup lang="ts">
import Chart from 'primevue/chart'
import Skeleton from 'primevue/skeleton'
import { computed, ref, watch } from 'vue'

import type { ChartPayload } from '../model/types'

const props = defineProps<{
  title: string
  type: string
  data: ChartPayload
  ready: boolean
  options?: Record<string, unknown>
  wide?: boolean
}>()

// Свежий инстанс графика на каждую загрузку — обходит гонку async-init PrimeVue Chart.
const renderKey = ref(0)
watch(
  () => props.ready,
  (ready) => {
    if (ready) {
      renderKey.value += 1
    }
  },
)

const chartOptions = computed(() => props.options ?? { responsive: true, maintainAspectRatio: false })
</script>

<template>
  <section class="stat-chart" :class="{ 'stat-chart--wide': wide }">
    <h3 class="stat-chart__title">{{ title }}</h3>

    <div class="stat-chart__body">
      <Skeleton v-if="!ready" height="100%" />
      <Chart v-else :key="renderKey" :type="type" :data="data" :options="chartOptions" />
    </div>
  </section>
</template>

<style scoped>
.stat-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.stat-chart--wide {
  grid-column: 1 / -1;
}

.stat-chart__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.stat-chart__body {
  height: 260px;
}
</style>
