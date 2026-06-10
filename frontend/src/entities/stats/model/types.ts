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
