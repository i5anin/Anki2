/** Состояние планирования карточки. */
export type CardState = 'new' | 'learning' | 'review' | 'relearning'

/** Карточка (единица планирования). */
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

/** Карточка с отрисованным содержимым и контекстом заметки. */
export interface RenderedCard extends Card {
  frontMarkdown: string
  backMarkdown: string
  noteFields: Record<string, string>
  noteTypeName: string
  tags: string[]
}
