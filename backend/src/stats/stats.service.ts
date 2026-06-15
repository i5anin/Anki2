import { Injectable } from '@nestjs/common'

import type { Card } from '../domain/card.entity'
import type { ReviewLog } from '../domain/review-log.entity'
import type { CardState } from '../srs'

import { DataStore } from '../store/data-store'
import { computeInsights, type StatsInsights } from './insights'

/** Карточка считается «зрелой», когда интервал review не меньше этого порога (дни). */
const MATURE_INTERVAL_DAYS = 21

/** Распределение карточек по состояниям планировщика. */
interface StateBreakdown {
  new: number
  learning: number
  review: number
  relearning: number
}

/** Сводка по колоде (или по всей коллекции). */
export interface StatsOverview {
  totalCards: number
  byState: StateBreakdown
  mature: number
  young: number
  suspended: number
  totalReviews: number
  retentionPct: number
}

/** Точка графика: дата и количество за этот день. */
export interface DayCount {
  date: string
  count: number
}

/** Разбивка повторений зрелых карточек по оценкам + удержание. */
export interface RetentionBreakdown {
  again: number
  hard: number
  good: number
  easy: number
  retentionPct: number
}

/** Начало сегодняшних суток (локальное время) в миллисекундах. */
function startOfToday(now: Date): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Локальный ключ дня в формате YYYY-MM-DD для момента времени. */
function dayKey(ms: number): string {
  const d = new Date(ms)
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Доля удачных повторений (rating > 1) среди повторений зрелых карточек, в процентах. */
function retentionPercent(matureLogs: ReviewLog[]): number {
  if (matureLogs.length === 0) return 0
  const passed = matureLogs.filter((log) => log.rating > 1).length
  return Math.round((passed / matureLogs.length) * 100)
}

@Injectable()
export class StatsService {
  constructor(private readonly store: DataStore) {}

  /** Карточки колоды (или все), включая отложенные — статистика учитывает их явно. */
  private listCards(deckId?: string): Promise<Card[]> {
    return this.store.listCards({ deckId, includeSuspended: true })
  }

  private listLogs(deckId?: string): Promise<ReviewLog[]> {
    return this.store.listReviewLogs({ deckId })
  }

  async overview(deckId?: string): Promise<StatsOverview> {
    const [cards, logs] = await Promise.all([this.listCards(deckId), this.listLogs(deckId)])

    const byState: StateBreakdown = { new: 0, learning: 0, review: 0, relearning: 0 }
    let mature = 0
    let young = 0
    let suspended = 0

    for (const card of cards) {
      byState[card.state] += 1
      if (card.isSuspended) suspended += 1
      if (card.state === 'review') {
        if (card.intervalDays >= MATURE_INTERVAL_DAYS) mature += 1
        else young += 1
      }
    }

    const matureLogs = logs.filter((log) => log.stateBefore === 'review')

    return {
      totalCards: cards.length,
      byState,
      mature,
      young,
      suspended,
      totalReviews: logs.length,
      retentionPct: retentionPercent(matureLogs),
    }
  }

  async forecast(deckId?: string, days = 30): Promise<DayCount[]> {
    const cards = await this.listCards(deckId)
    const now = new Date()
    const startMs = startOfToday(now)
    const dayMs = 24 * 60 * 60 * 1000

    const counts = Array.from({ length: days }, () => 0)
    const scheduled = new Set<CardState>(['review', 'relearning'])

    for (const card of cards) {
      if (!scheduled.has(card.state)) continue
      const dueMs = new Date(card.due).getTime()
      const offset = Math.floor((dueMs - startMs) / dayMs)
      const index = Math.min(Math.max(offset, 0), days - 1)
      counts[index] += 1
    }

    return counts.map((count, index) => ({
      date: dayKey(startMs + index * dayMs),
      count,
    }))
  }

  async retention(deckId?: string): Promise<RetentionBreakdown> {
    const logs = await this.listLogs(deckId)
    const matureLogs = logs.filter((log) => log.stateBefore === 'review')

    const breakdown: RetentionBreakdown = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      retentionPct: retentionPercent(matureLogs),
    }

    for (const log of matureLogs) {
      switch (log.rating) {
        case 1: {
          breakdown.again += 1
          break
        }
        case 2: {
          breakdown.hard += 1
          break
        }
        case 3: {
          breakdown.good += 1
          break
        }
        default: {
          breakdown.easy += 1
        }
      }
    }

    return breakdown
  }

  async reviewsByDay(deckId?: string, days = 30): Promise<DayCount[]> {
    const logs = await this.listLogs(deckId)
    const now = new Date()
    const startMs = startOfToday(now)
    const dayMs = 24 * 60 * 60 * 1000
    const windowStart = startMs - (days - 1) * dayMs

    const counts = Array.from({ length: days }, () => 0)

    for (const log of logs) {
      const reviewedMs = new Date(log.reviewedAt).getTime()
      if (reviewedMs < windowStart) continue
      const offset = Math.floor((reviewedMs - windowStart) / dayMs)
      if (offset < 0 || offset >= days) continue
      counts[offset] += 1
    }

    return counts.map((count, index) => ({
      date: dayKey(windowStart + index * dayMs),
      count,
    }))
  }

  async insights(deckId?: string): Promise<StatsInsights> {
    const [cards, logs] = await Promise.all([this.listCards(deckId), this.listLogs(deckId)])
    return computeInsights(cards, logs, new Date())
  }
}
