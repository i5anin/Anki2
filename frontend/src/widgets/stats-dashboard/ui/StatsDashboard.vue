<script setup lang="ts">
import Chart from 'primevue/chart'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import { useStatsData } from '../model/useStatsData'

const props = defineProps<{ deckId?: string }>()

const {
  metrics,
  ready,
  error,
  forecastData,
  retentionData,
  reviewsData,
  forecastOptions,
  retentionOptions,
  reviewsOptions,
} = useStatsData(() => props.deckId)
</script>

<template>
  <div class="stats-dashboard">
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div class="stats-dashboard__metrics">
      <template v-if="!ready">
        <Skeleton v-for="n in 7" :key="n" height="5.5rem" border-radius="0.75rem" />
      </template>

      <article v-for="metric in metrics" v-else :key="metric.key" class="stats-dashboard__metric">
        <span class="stats-dashboard__metric-icon" :style="{ color: metric.color }">
          <i :class="metric.icon" />
        </span>
        <span class="stats-dashboard__metric-value">{{ metric.value }}</span>
        <span class="stats-dashboard__metric-label">{{ metric.label }}</span>
      </article>
    </div>

    <div class="stats-dashboard__charts">
      <section class="stats-dashboard__chart">
        <h2 class="stats-dashboard__chart-title">Прогноз нагрузки</h2>
        <div class="stats-dashboard__chart-body">
          <Skeleton v-if="!ready" height="100%" />
          <Chart
            v-else
            :key="`${props.deckId ?? 'all'}-forecast`"
            type="bar"
            :data="forecastData"
            :options="forecastOptions"
          />
        </div>
      </section>

      <section class="stats-dashboard__chart">
        <h2 class="stats-dashboard__chart-title">Удержание по оценкам</h2>
        <div class="stats-dashboard__chart-body">
          <Skeleton v-if="!ready" height="100%" />
          <Chart
            v-else
            :key="`${props.deckId ?? 'all'}-retention`"
            type="doughnut"
            :data="retentionData"
            :options="retentionOptions"
          />
        </div>
      </section>

      <section class="stats-dashboard__chart stats-dashboard__chart--wide">
        <h2 class="stats-dashboard__chart-title">Повторения по дням</h2>
        <div class="stats-dashboard__chart-body">
          <Skeleton v-if="!ready" height="100%" />
          <Chart
            v-else
            :key="`${props.deckId ?? 'all'}-reviews`"
            type="line"
            :data="reviewsData"
            :options="reviewsOptions"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.stats-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-dashboard__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 1rem;
}

.stats-dashboard__metric {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.stats-dashboard__metric-icon {
  font-size: 1.25rem;
}

.stats-dashboard__metric-value {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
}

.stats-dashboard__metric-label {
  font-size: 0.82rem;
  color: var(--app-muted);
}

.stats-dashboard__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.stats-dashboard__chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
}

.stats-dashboard__chart--wide {
  grid-column: 1 / -1;
}

.stats-dashboard__chart-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.stats-dashboard__chart-body {
  height: 260px;
}

@media (max-width: 720px) {
  .stats-dashboard__charts {
    grid-template-columns: 1fr;
  }

  .stats-dashboard__chart--wide {
    grid-column: auto;
  }
}
</style>
