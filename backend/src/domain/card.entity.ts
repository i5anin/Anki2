import type { CardState } from '../srs'
import type { NoteFields } from './note.entity'

/** Карточка (единица планирования) в формате API. */
export interface Card {
  id: string
  noteId: string
  deckId: string
  templateIndex: number
  state: CardState
  due: string
  intervalDays: number
  easeFactor: number
  reps: number
  lapses: number
  learningStep: number
  isSuspended: boolean
  lastReviewedAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Карточка с отрисованным содержимым и контекстом заметки —
 * отдаётся в учебную очередь и в обзор карточек.
 */
export interface RenderedCard extends Card {
  frontMarkdown: string
  backMarkdown: string
  noteFields: NoteFields
  noteTypeName: string
  tags: string[]
}

/** Строка таблицы anki.cards (snake_case). */
export interface CardRow {
  id: string
  note_id: string
  deck_id: string
  template_index: number
  state: CardState
  due: string
  interval_days: number
  ease_factor: number
  reps: number
  lapses: number
  learning_step: number
  is_suspended: boolean
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}
