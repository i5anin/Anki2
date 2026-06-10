import type { DeckConfig } from '../srs'

/** Колода в формате API (camelCase). */
export interface Deck {
  id: string
  name: string
  description: string
  config: DeckConfig
  createdAt: string
  updatedAt: string
}

/** Счётчики карточек колоды для учебной очереди. */
export interface DeckCounts {
  new: number
  learning: number
  review: number
  /** Сколько карточек к показу прямо сейчас (с учётом лимитов). */
  due: number
  total: number
}

/** Колода со счётчиками — для списка колод. */
export interface DeckWithCounts extends Deck {
  counts: DeckCounts
}

/** Строка таблицы anki.decks (snake_case). */
export interface DeckRow {
  id: string
  name: string
  description: string
  config: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
