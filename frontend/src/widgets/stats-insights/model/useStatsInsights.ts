import { onMounted, ref, type Ref, watch } from 'vue'

import type { ChartPayload } from '@/widgets/stat-chart'

import { deckApi, type DeckWithCounts } from '@/entities/deck'
import { statsApi, type StatsInsights } from '@/entities/stats'
import { getErrorMessage } from '@/shared/api'
import { formatDate } from '@/shared/lib'

const PALETTE = {
  indigo: '#6366f1',
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  violet: '#8b5cf6',
} as const

const noLegend = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
const bottomLegend = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
}
const stacked = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { x: { stacked: true }, y: { stacked: true } },
}

export interface StatsInsightsData {
  ready: Ref<boolean>
  error: Ref<string | null>
  ease: Ref<ChartPayload>
  interval: Ref<ChartPayload>
  answers: Ref<ChartPayload>
  hours: Ref<ChartPayload>
  time: Ref<ChartPayload>
  activity: Ref<ChartPayload>
  decks: Ref<ChartPayload>
  noLegend: typeof noLegend
  bottomLegend: typeof bottomLegend
  stacked: typeof stacked
}

function emptyPayload(): ChartPayload {
  return { labels: [], datasets: [] }
}

function bars(labels: string[], data: number[], color: string): ChartPayload {
  return { labels, datasets: [{ data, backgroundColor: color, borderRadius: 4 }] }
}

function buildAnswers(a: StatsInsights['answerButtons']): ChartPayload {
  return {
    labels: ['Снова', 'Трудно', 'Хорошо', 'Легко'],
    datasets: [
      { data: [a.again, a.hard, a.good, a.easy], backgroundColor: [PALETTE.red, PALETTE.amber, PALETTE.green, PALETTE.indigo] },
    ],
  }
}

function buildTime(ins: StatsInsights): ChartPayload {
  return {
    labels: ins.timeByDay.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: 'Минут',
        data: ins.timeByDay.map((point) => point.minutes),
        borderColor: PALETTE.amber,
        backgroundColor: 'rgba(245, 158, 11, 0.18)',
        tension: 0.35,
        fill: true,
      },
    ],
  }
}

function buildDecks(list: DeckWithCounts[]): ChartPayload {
  return {
    labels: list.map((deck) => deck.name),
    datasets: [
      { label: 'Новые', data: list.map((deck) => deck.counts.new), backgroundColor: PALETTE.indigo },
      { label: 'Изучаются', data: list.map((deck) => deck.counts.learning), backgroundColor: PALETTE.amber },
      { label: 'Повторение', data: list.map((deck) => deck.counts.review), backgroundColor: PALETTE.green },
    ],
  }
}

/** Загрузка и подготовка графиков расширенной аналитики. */
export function useStatsInsights(getDeckId: () => string | undefined): StatsInsightsData {
  const ready = ref(false)
  const error = ref<string | null>(null)
  const ease = ref(emptyPayload())
  const interval = ref(emptyPayload())
  const answers = ref(emptyPayload())
  const hours = ref(emptyPayload())
  const time = ref(emptyPayload())
  const activity = ref(emptyPayload())
  const decks = ref(emptyPayload())

  async function load(): Promise<void> {
    const deckId = getDeckId()
    ready.value = false
    error.value = null
    try {
      const [ins, deckList] = await Promise.all([statsApi.insights(deckId), deckApi.getList()])
      ease.value = bars(ins.easeDistribution.map((b) => b.label), ins.easeDistribution.map((b) => b.count), PALETTE.violet)
      interval.value = bars(ins.intervalDistribution.map((b) => b.label), ins.intervalDistribution.map((b) => b.count), PALETTE.blue)
      answers.value = buildAnswers(ins.answerButtons)
      hours.value = bars(ins.reviewsByHour.map((_, h) => `${h}`), ins.reviewsByHour, PALETTE.indigo)
      time.value = buildTime(ins)
      activity.value = bars(ins.activity.map((point) => formatDate(point.date)), ins.activity.map((point) => point.count), PALETTE.green)
      decks.value = buildDecks(deckList)
      ready.value = true
    } catch (error_) {
      error.value = getErrorMessage(error_)
    }
  }

  onMounted(() => {
    void load()
  })
  watch(getDeckId, () => {
    void load()
  })

  return { ready, error, ease, interval, answers, hours, time, activity, decks, noLegend, bottomLegend, stacked }
}
