/** Сводная статистика. */
export interface StatsOverview {
  totalCards: number
  byState: { new: number; learning: number; review: number; relearning: number }
  mature: number
  young: number
  suspended: number
  totalReviews: number
  retentionPct: number
}

/** Точка прогноза нагрузки. */
export interface ForecastPoint {
  date: string
  count: number
}

/** Удержание по оценкам. */
export interface RetentionStats {
  again: number
  hard: number
  good: number
  easy: number
  retentionPct: number
}

/** Точка истории повторений. */
export interface ReviewsByDayPoint {
  date: string
  count: number
}

/** Корзина гистограммы (распределение). */
export interface StatsBucket {
  label: string
  count: number
}

/** Время по дню (минуты). */
export interface DayMinutes {
  date: string
  minutes: number
}

/** Расширенная аналитика (один запрос). */
export interface StatsInsights {
  easeDistribution: StatsBucket[]
  intervalDistribution: StatsBucket[]
  answerButtons: { again: number; hard: number; good: number; easy: number }
  reviewsByHour: number[]
  timeByDay: DayMinutes[]
  activity: ReviewsByDayPoint[]
}
