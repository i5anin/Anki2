<script setup lang="ts">
import Chart from 'primevue/chart'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import { computed, onMounted, ref, watch } from 'vue'

import {
  statsApi,
  type ForecastPoint,
  type RetentionStats,
  type ReviewsByDayPoint,
  type StatsOverview,
} from '@/entities/stats'
import { getErrorMessage } from '@/shared/api'
import { formatDate } from '@/shared/lib'

const props = defineProps<{ deckId?: string }>()

const PALETTE = {
  indigo: '#6366f1',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
} as const

const overview = ref<StatsOverview | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const ready = ref(false)

interface MetricCard {
  key: string
  label: string
  value: string
  icon: string
  color: string
}

const metrics = computed<MetricCard[]>(() => {
  const o = overview.value
  if (!o) return []
  return [
    {
      key: 'total',
      label: 'Всего карточек',
      value: String(o.totalCards),
      icon: 'pi pi-clone',
      color: PALETTE.indigo,
    },
    {
      key: 'new',
      label: 'Новые',
      value: String(o.byState.new),
      icon: 'pi pi-sparkles',
      color: PALETTE.indigo,
    },
    {
      key: 'learning',
      label: 'Learning',
      value: String(o.byState.learning + o.byState.relearning),
      icon: 'pi pi-hourglass',
      color: PALETTE.amber,
    },
    {
      key: 'review',
      label: 'Review',
      value: String(o.byState.review),
      icon: 'pi pi-replay',
      color: PALETTE.green,
    },
    {
      key: 'mature',
      label: 'Зрелые',
      value: String(o.mature),
      icon: 'pi pi-verified',
      color: PALETTE.green,
    },
    {
      key: 'reviews',
      label: 'Повторений всего',
      value: String(o.totalReviews),
      icon: 'pi pi-history',
      color: PALETTE.indigo,
    },
    {
      key: 'retention',
      label: 'Удержание',
      value: `${o.retentionPct}%`,
      icon: 'pi pi-percentage',
      color: PALETTE.green,
    },
  ]
})

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

const forecastOptions = {
  ...baseOptions,
  plugins: { legend: { display: false } },
}

const retentionOptions = {
  ...baseOptions,
  plugins: { legend: { position: 'bottom' as const } },
}

const reviewsOptions = {
  ...baseOptions,
  plugins: { legend: { display: false } },
}

function buildForecast(list: ForecastPoint[]) {
  return {
    labels: list.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: 'Карточек к повторению',
        data: list.map((point) => point.count),
        backgroundColor: PALETTE.indigo,
        borderRadius: 4,
      },
    ],
  }
}

function buildRetention(r: RetentionStats | null) {
  return {
    labels: ['Снова', 'Трудно', 'Хорошо', 'Легко'],
    datasets: [
      {
        data: r ? [r.again, r.hard, r.good, r.easy] : [],
        backgroundColor: [PALETTE.red, PALETTE.amber, PALETTE.green, PALETTE.indigo],
      },
    ],
  }
}

function buildReviews(list: ReviewsByDayPoint[]) {
  return {
    labels: list.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: 'Повторений',
        data: list.map((point) => point.count),
        borderColor: PALETTE.green,
        backgroundColor: 'rgba(34, 197, 94, 0.18)',
        tension: 0.35,
        fill: true,
      },
    ],
  }
}

const forecastData = ref(buildForecast([]))
const retentionData = ref(buildRetention(null))
const reviewsData = ref(buildReviews([]))

async function load(): Promise<void> {
  ready.value = false
  isLoading.value = true
  error.value = null
  try {
    const [overviewData, forecastList, retentionResult, reviewsList] = await Promise.all([
      statsApi.overview(props.deckId),
      statsApi.forecast(props.deckId),
      statsApi.retention(props.deckId),
      statsApi.reviewsByDay(props.deckId),
    ])
    overview.value = overviewData
    forecastData.value = buildForecast(forecastList)
    retentionData.value = buildRetention(retentionResult)
    reviewsData.value = buildReviews(reviewsList)
    ready.value = true
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load()
})

watch(
  () => props.deckId,
  () => {
    void load()
  },
)
</script>

<template>
  <div class="stats-dashboard">
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div class="stats-dashboard__metrics">
      <template v-if="isLoading && !overview">
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
