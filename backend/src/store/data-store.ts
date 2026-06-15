import type { Card } from '../domain/card.entity'
import type { Deck } from '../domain/deck.entity'
import type { CardTemplate, NoteType } from '../domain/note-type.entity'
import type { Note, NoteFields } from '../domain/note.entity'
import type { QuizItem } from '../domain/quiz-item.entity'
import type { ReviewLog } from '../domain/review-log.entity'
import type { TrainerResult, TrainerSkill } from '../domain/trainer-result.entity'
import type { DeckConfig } from '../srs'
import type { CardState, Rating } from '../srs'

// --- Входные типы (camelCase) ------------------------------------------------

export interface DeckInput {
  name: string
  description?: string
  config?: Partial<DeckConfig>
}
export interface DeckPatch {
  name?: string
  description?: string
  config?: Partial<DeckConfig>
}

export interface NoteTypeInput {
  name: string
  fields: string[]
  templates: CardTemplate[]
  isCloze?: boolean
}
export interface NoteTypePatch {
  name?: string
  fields?: string[]
  templates?: CardTemplate[]
  isCloze?: boolean
}

export interface NoteInput {
  noteTypeId: string
  deckId: string
  fields: NoteFields
  tags?: string[]
}
export interface NotePatch {
  deckId?: string
  fields?: NoteFields
  tags?: string[]
}

/** Новая карточка; поля планировщика опциональны (стор подставит дефолты). */
export interface NewCard {
  noteId: string
  deckId: string
  templateIndex: number
}

/** Патч карточки: и планировщик, и организационные поля. */
export interface CardPatch {
  deckId?: string
  templateIndex?: number
  state?: CardState
  due?: string
  intervalDays?: number
  easeFactor?: number
  reps?: number
  lapses?: number
  learningStep?: number
  isSuspended?: boolean
  lastReviewedAt?: string | null
}

export interface CardFilter {
  deckId?: string
  noteId?: string
  state?: CardState
  includeSuspended?: boolean
}

export interface NewReviewLog {
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
}

export interface ReviewLogFilter {
  deckId?: string
  cardId?: string
  /** ISO-дата: вернуть записи начиная с этого момента. */
  since?: string
}

export interface NewTrainerResult {
  trainerId: string
  skill: TrainerSkill
  level: number
  score: number
  accuracy: number
  durationMs: number
}

export interface TrainerResultFilter {
  trainerId?: string
  /** ISO-дата: вернуть результаты начиная с этого момента. */
  since?: string
}

export interface QuizItemFilter {
  category?: string
}

/**
 * Абстракция доступа к данным. Две реализации: `SupabaseDataStore` (боевая)
 * и `MemoryDataStore` (демо/офлайн, без ключей). Сервисы зависят только от
 * этого интерфейса — БД-специфика инкапсулирована в реализациях.
 */
export abstract class DataStore {
  // Колоды
  abstract listDecks(): Promise<Deck[]>
  abstract getDeck(id: string): Promise<Deck | null>
  abstract createDeck(input: DeckInput): Promise<Deck>
  abstract updateDeck(id: string, patch: DeckPatch): Promise<Deck | null>
  abstract deleteDeck(id: string): Promise<boolean>

  // Модели заметок
  abstract listNoteTypes(): Promise<NoteType[]>
  abstract getNoteType(id: string): Promise<NoteType | null>
  abstract createNoteType(input: NoteTypeInput): Promise<NoteType>
  abstract updateNoteType(id: string, patch: NoteTypePatch): Promise<NoteType | null>
  abstract deleteNoteType(id: string): Promise<boolean>

  // Заметки
  abstract listNotes(deckId?: string): Promise<Note[]>
  abstract getNote(id: string): Promise<Note | null>
  abstract createNote(input: NoteInput): Promise<Note>
  abstract updateNote(id: string, patch: NotePatch): Promise<Note | null>
  abstract deleteNote(id: string): Promise<boolean>

  // Карточки
  abstract listCards(filter?: CardFilter): Promise<Card[]>
  abstract getCard(id: string): Promise<Card | null>
  abstract createCards(cards: NewCard[]): Promise<Card[]>
  abstract updateCard(id: string, patch: CardPatch): Promise<Card | null>
  abstract deleteCard(id: string): Promise<boolean>
  abstract deleteCardsByNote(noteId: string): Promise<void>

  // Журнал повторений
  abstract createReviewLog(input: NewReviewLog): Promise<ReviewLog>
  abstract listReviewLogs(filter?: ReviewLogFilter): Promise<ReviewLog[]>

  // Результаты тренажёров
  abstract createTrainerResult(input: NewTrainerResult): Promise<TrainerResult>
  abstract listTrainerResults(filter?: TrainerResultFilter): Promise<TrainerResult[]>

  // Банк вопросов блица (только чтение; наполняется сидом)
  abstract listQuizItems(filter?: QuizItemFilter): Promise<QuizItem[]>
}
