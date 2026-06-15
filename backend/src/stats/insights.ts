import type { Card } from '../domain/card.entity'
import type { ReviewLog } from '../domain/review-log.entity'

const DAY_MS = 24 * 60 * 60 * 1000

export interface Bucket {
  label: string
  count: number
}

export interface DayMinutes {
  date: string
  minutes: number
}

export interface DayCountPoint {
  date: string
  count: number
}

/** Расширенная аналитика для дашборда (всё за один запрос). */
export interface StatsInsights {
  easeDistribution: Bucket[]
  intervalDistribution: Bucket[]
  answerButtons: { again: number; hard: number; good: number; easy: number }
  reviewsByHour: number[]
  timeByDay: DayMinutes[]
  activity: DayCountPoint[]
}

function dayKey(ms: number): string {
  const d = new Date(ms)
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function startOfToday(now: Date): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Индекс корзины: первый порог, которому value не превышает; иначе последняя. */
function bucketIndex(value: number, edges: number[]): number {
  for (const [i, edge] of edges.entries()) {
    if (value <= edge) {
      return i
    }
  }
  return edges.length
}

/** Распределение ease-фактора карточек review/relearning. */
function easeDistribution(cards: Card[]): Bucket[] {
  const buckets: Bucket[] = [
    { label: '< 2.0', count: 0 },
    { label: '2.0–2.3', count: 0 },
    { label: '2.3–2.5', count: 0 },
    { label: '2.5–2.7', count: 0 },
    { label: '≥ 2.7', count: 0 },
  ]
  for (const card of cards) {
    if (card.state !== 'review' && card.state !== 'relearning') continue
    buckets[bucketIndex(card.easeFactor, [2, 2.3, 2.5, 2.7])].count += 1
  }
  return buckets
}

/** Распределение интервалов повторения. */
function intervalDistribution(cards: Card[]): Bucket[] {
  const buckets: Bucket[] = [
    { label: '1 д', count: 0 },
    { label: '2–7 д', count: 0 },
    { label: '8–30 д', count: 0 },
    { label: '31–90 д', count: 0 },
    { label: '> 90 д', count: 0 },
  ]
  for (const card of cards) {
    if (card.state !== 'review' && card.state !== 'relearning') continue
    if (card.intervalDays < 1) continue
    buckets[bucketIndex(card.intervalDays, [1, 7, 30, 90])].count += 1
  }
  return buckets
}

function answerButtons(logs: ReviewLog[]): {
  again: number
  hard: number
  good: number
  easy: number
} {
  const out = { again: 0, hard: 0, good: 0, easy: 0 }
  for (const log of logs) {
    switch (log.rating) {
      case 1: {
        out.again += 1
        break
      }
      case 2: {
        out.hard += 1
        break
      }
      case 3: {
        out.good += 1
        break
      }
      default: {
        out.easy += 1
      }
    }
  }
  return out
}

function reviewsByHour(logs: ReviewLog[]): number[] {
  const hours = Array.from({ length: 24 }, () => 0)
  for (const log of logs) {
    hours[new Date(log.reviewedAt).getHours()] += 1
  }
  return hours
}

function bucketByDay(logs: ReviewLog[], now: Date, days: number): Map<string, ReviewLog[]> {
  const startMs = startOfToday(now) - (days - 1) * DAY_MS
  const map = new Map<string, ReviewLog[]>()
  for (let i = 0; i < days; i += 1) {
    map.set(dayKey(startMs + i * DAY_MS), [])
  }
  for (const log of logs) {
    const key = dayKey(new Date(log.reviewedAt).getTime())
    const bucket = map.get(key)
    if (bucket) bucket.push(log)
  }
  return map
}

function timeByDay(logs: ReviewLog[], now: Date, days: number): DayMinutes[] {
  const map = bucketByDay(logs, now, days)
  return [...map.entries()].map(([date, dayLogs]) => {
    const ms = dayLogs.reduce((sum, log) => sum + log.timeTakenMs, 0)
    return { date, minutes: Math.round((ms / 60_000) * 10) / 10 }
  })
}

function activity(logs: ReviewLog[], now: Date, days: number): DayCountPoint[] {
  const map = bucketByDay(logs, now, days)
  return [...map.entries()].map(([date, dayLogs]) => ({ date, count: dayLogs.length }))
}

/** Считает расширенную аналитику по карточкам и журналу повторений. */
export function computeInsights(cards: Card[], logs: ReviewLog[], now: Date): StatsInsights {
  return {
    easeDistribution: easeDistribution(cards),
    intervalDistribution: intervalDistribution(cards),
    answerButtons: answerButtons(logs),
    reviewsByHour: reviewsByHour(logs),
    timeByDay: timeByDay(logs, now, 30),
    activity: activity(logs, now, 90),
  }
}
