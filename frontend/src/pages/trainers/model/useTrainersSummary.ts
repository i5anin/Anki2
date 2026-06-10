import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { TRAINERS, trainerApi, type TrainerDef, type TrainerResult } from '@/entities/trainer'
import { getErrorMessage } from '@/shared/api'

/** Чип сводки наверху хаба тренажёров. */
export interface SummaryChip {
  key: string
  icon: string
  label: string
  value: number
}

interface TrainerAggregate {
  best: number
  sessions: number
}

interface TrainersSummary {
  results: Ref<TrainerResult[]>
  isLoading: Ref<boolean>
  error: Ref<string>
  summary: ComputedRef<SummaryChip[]>
  dailyTrainers: ComputedRef<TrainerDef[]>
  load: () => Promise<void>
  bestLabel: (trainerId: string) => string
  sessionsLabel: (trainerId: string) => string
}

/** Ключ локального дня (без времени) для группировки сессий. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** Загрузка результатов и сводные показатели для хаба тренажёров. */
export function useTrainersSummary(): TrainersSummary {
  const results = ref<TrainerResult[]>([])
  const isLoading = ref(true)
  const error = ref('')

  async function load(): Promise<void> {
    try {
      results.value = await trainerApi.getResults()
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isLoading.value = false
    }
  }

  const todayCount = computed(() => {
    const today = dayKey(new Date())
    return results.value.filter((result) => dayKey(new Date(result.playedAt)) === today).length
  })

  const streakDays = computed(() => {
    const played = new Set(results.value.map((result) => dayKey(new Date(result.playedAt))))
    const cursor = new Date()
    if (!played.has(dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1)
    }
    let streak = 0
    while (played.has(dayKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  })

  const summary = computed<SummaryChip[]>(() => [
    { key: 'today', icon: 'pi pi-calendar', label: 'Сегодня сессий', value: todayCount.value },
    { key: 'streak', icon: 'pi pi-bolt', label: 'Серия дней', value: streakDays.value },
    { key: 'total', icon: 'pi pi-list-check', label: 'Всего сессий', value: results.value.length },
  ])

  const dailyTrainers = computed<TrainerDef[]>(() => {
    const start = new Date().getDate() % TRAINERS.length
    return [0, 1, 2].map((offset) => TRAINERS[(start + offset) % TRAINERS.length])
  })

  const aggregates = computed(() => {
    const map = new Map<string, TrainerAggregate>()
    for (const result of results.value) {
      const entry = map.get(result.trainerId) ?? { best: 0, sessions: 0 }
      entry.best = Math.max(entry.best, result.score)
      entry.sessions += 1
      map.set(result.trainerId, entry)
    }
    return map
  })

  function bestLabel(trainerId: string): string {
    const entry = aggregates.value.get(trainerId)
    return entry !== undefined ? String(entry.best) : '—'
  }

  function sessionsLabel(trainerId: string): string {
    const entry = aggregates.value.get(trainerId)
    return entry !== undefined ? String(entry.sessions) : '—'
  }

  return { results, isLoading, error, summary, dailyTrainers, load, bestLabel, sessionsLabel }
}
