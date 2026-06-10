import type { CardState, Rating } from '../srs'

/** Запись журнала повторений в формате API. */
export interface ReviewLog {
  id: string
  cardId: string
  rating: Rating
  stateBefore: CardState
  stateAfter: CardState
  intervalBefore: number
  intervalAfter: number
  easeBefore: number
  easeAfter: number
  elapsedDays: number
  timeTakenMs: number
  reviewedAt: string
}

/** Строка таблицы anki.review_logs (snake_case). */
export interface ReviewLogRow {
  id: string
  card_id: string
  rating: Rating
  state_before: CardState
  state_after: CardState
  interval_before: number
  interval_after: number
  ease_before: number
  ease_after: number
  elapsed_days: number
  time_taken_ms: number
  reviewed_at: string
}
