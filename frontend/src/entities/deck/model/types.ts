/** Конфигурация планировщика колоды (зеркало бэкенда). */
export interface DeckConfig {
  learningSteps: number[]
  relearningSteps: number[]
  graduatingIntervalDays: number
  easyIntervalDays: number
  startingEase: number
  easyBonus: number
  hardIntervalFactor: number
  lapseIntervalMultiplier: number
  intervalModifier: number
  easeMinimum: number
  minimumIntervalDays: number
  maximumIntervalDays: number
  newCardsPerDay: number
  maxReviewsPerDay: number
}

/** Счётчики карточек колоды. */
export interface DeckCounts {
  new: number
  learning: number
  review: number
  due: number
  total: number
}

/** Колода. */
export interface Deck {
  id: string
  name: string
  description: string
  config: DeckConfig
  createdAt: string
  updatedAt: string
}

/** Колода со счётчиками — для списка колод. */
export interface DeckWithCounts extends Deck {
  counts: DeckCounts
}

/** Данные формы создания/редактирования колоды. */
export interface DeckDraft {
  name: string
  description: string
}
