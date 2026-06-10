import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue'

import {
  statsApi,
  type ForecastPoint,
  type RetentionStats,
  type ReviewsByDayPoint,
  type StatsOverview,
} from '@/entities/stats'
import { getErrorMessage } from '@/shared/api'
import { formatDate } from '@/shared/lib'

const PALETTE = {
  indigo: '#6366f1',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
} as const

export interface MetricCard {
  key: string
  label: string
  value: string
  icon: string
  color: string
}

export interface ChartPayload {
  labels: string[]
  datasets: Record<string, unknown>[]
}

type ChartOptions = Record<string, unknown>

interface StatsData {
  metrics: ComputedRef<MetricCard[]>
  ready: Ref<boolean>
  error: Ref<string | null>
  forecastData: Ref<ChartPayload>
  retentionData: Ref<ChartPayload>
  reviewsData: Ref<ChartPayload>
  forecastOptions: ChartOptions
  retentionOptions: ChartOptions
  reviewsOptions: ChartOptions
}

const baseOptions = { responsive: true, maintainAspectRatio: false }

function buildForecast(list: ForecastPoint[]): ChartPayload {
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

function buildRetention(r: RetentionStats | null): ChartPayload {
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

function buildReviews(list: ReviewsByDayPoint[]): ChartPayload {
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

function toMetrics(o: StatsOverview): MetricCard[] {
  return [
    { key: 'total', label: 'Всего карточек', value: String(o.totalCards), icon: 'pi pi-clone', color: PALETTE.indigo },
    { key: 'new', label: 'Новые', value: String(o.byState.new), icon: 'pi pi-sparkles', color: PALETTE.indigo },
    {
      key: 'learning',
      label: 'Learning',
      value: String(o.byState.learning + o.byState.relearning),
      icon: 'pi pi-hourglass',
      color: PALETTE.amber,
    },
    { key: 'review', label: 'Review', value: String(o.byState.review), icon: 'pi pi-replay', color: PALETTE.green },
    { key: 'mature', label: 'Зрелые', value: String(o.mature), icon: 'pi pi-verified', color: PALETTE.green },
    { key: 'reviews', label: 'Повторений всего', value: String(o.totalReviews), icon: 'pi pi-history', color: PALETTE.indigo },
    { key: 'retention', label: 'Удержание', value: `${o.retentionPct}%`, icon: 'pi pi-percentage', color: PALETTE.green },
  ]
}

/** Загрузка и подготовка данных дашборда статистики (для виджета stats-dashboard). */
export function useStatsData(getDeckId: () => string | undefined): StatsData {
  const overview = ref<StatsOverview | null>(null)
  const ready = ref(false)
  const error = ref<string | null>(null)

  const forecastData = ref(buildForecast([]))
  const retentionData = ref(buildRetention(null))
  const reviewsData = ref(buildReviews([]))

  const metrics = computed<MetricCard[]>(() => (overview.value ? toMetrics(overview.value) : []))

  const forecastOptions: ChartOptions = { ...baseOptions, plugins: { legend: { display: false } } }
  const retentionOptions: ChartOptions = {
    ...baseOptions,
    plugins: { legend: { position: 'bottom' } },
  }
  const reviewsOptions: ChartOptions = { ...baseOptions, plugins: { legend: { display: false } } }

  async function load(): Promise<void> {
    const deckId = getDeckId()
    ready.value = false
    error.value = null
    try {
      const [overviewData, forecastList, retentionResult, reviewsList] = await Promise.all([
        statsApi.overview(deckId),
        statsApi.forecast(deckId),
        statsApi.retention(deckId),
        statsApi.reviewsByDay(deckId),
      ])
      overview.value = overviewData
      forecastData.value = buildForecast(forecastList)
      retentionData.value = buildRetention(retentionResult)
      reviewsData.value = buildReviews(reviewsList)
      ready.value = true
    } catch (e) {
      error.value = getErrorMessage(e)
    }
  }

  onMounted(() => {
    void load()
  })
  watch(getDeckId, () => {
    void load()
  })

  return {
    metrics,
    ready,
    error,
    forecastData,
    retentionData,
    reviewsData,
    forecastOptions,
    retentionOptions,
    reviewsOptions,
  }
}
