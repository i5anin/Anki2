import type { Card } from '../domain/card.entity'
import type { Deck } from '../domain/deck.entity'
import type { NoteType } from '../domain/note-type.entity'
import type { Note } from '../domain/note.entity'
import type { QuizItem } from '../domain/quiz-item.entity'
import type { ReviewLog } from '../domain/review-log.entity'
import type { TrainerResult } from '../domain/trainer-result.entity'
import type {
  CardFilter,
  CardPatch,
  DeckInput,
  DeckPatch,
  NewCard,
  NewReviewLog,
  NewTrainerResult,
  NoteInput,
  NotePatch,
  NoteTypeInput,
  NoteTypePatch,
  QuizItemFilter,
  ReviewLogFilter,
  TrainerResultFilter,
} from './data-store'

import { DataStore } from './data-store'
import {
  applyCardPatch,
  applyDeckPatch,
  applyNotePatch,
  applyNoteTypePatch,
  makeCards,
  makeDeck,
  makeNote,
  makeNoteType,
  makeReviewLog,
  makeTrainerResult,
} from './memory.factory'
import { createSeedData } from './seed'

/**
 * Реализация {@link DataStore} в памяти процесса (демо/офлайн-режим без ключей).
 * Данные инициализируются из {@link createSeedData}; журнал повторений пуст.
 * Класс обычный (без `@Injectable`) — его предоставляет фабрика стора.
 */
export class MemoryDataStore extends DataStore {
  private readonly decks: Deck[]
  private readonly noteTypes: NoteType[]
  private readonly notes: Note[]
  private readonly cards: Card[]
  private readonly reviewLogs: ReviewLog[]
  private readonly trainerResults: TrainerResult[]
  private readonly quizItems: QuizItem[]

  constructor() {
    super()
    const seed = createSeedData()
    this.decks = seed.decks
    this.noteTypes = seed.noteTypes
    this.notes = seed.notes
    this.cards = seed.cards
    this.reviewLogs = []
    this.trainerResults = []
    this.quizItems = seed.quizItems
  }

  // Колоды

  async listDecks(): Promise<Deck[]> {
    return this.decks
  }

  async getDeck(id: string): Promise<Deck | null> {
    return this.decks.find((deck) => deck.id === id) ?? null
  }

  async createDeck(input: DeckInput): Promise<Deck> {
    const deck = makeDeck(input)
    this.decks.push(deck)
    return deck
  }

  async updateDeck(id: string, patch: DeckPatch): Promise<Deck | null> {
    const deck = this.decks.find((item) => item.id === id)
    if (!deck) return null
    applyDeckPatch(deck, patch)
    return deck
  }

  async deleteDeck(id: string): Promise<boolean> {
    const index = this.decks.findIndex((deck) => deck.id === id)
    if (index === -1) return false
    this.decks.splice(index, 1)
    return true
  }

  // Модели заметок

  async listNoteTypes(): Promise<NoteType[]> {
    return this.noteTypes
  }

  async getNoteType(id: string): Promise<NoteType | null> {
    return this.noteTypes.find((noteType) => noteType.id === id) ?? null
  }

  async createNoteType(input: NoteTypeInput): Promise<NoteType> {
    const noteType = makeNoteType(input)
    this.noteTypes.push(noteType)
    return noteType
  }

  async updateNoteType(id: string, patch: NoteTypePatch): Promise<NoteType | null> {
    const noteType = this.noteTypes.find((item) => item.id === id)
    if (!noteType) return null
    applyNoteTypePatch(noteType, patch)
    return noteType
  }

  async deleteNoteType(id: string): Promise<boolean> {
    const index = this.noteTypes.findIndex((noteType) => noteType.id === id)
    if (index === -1) return false
    this.noteTypes.splice(index, 1)
    return true
  }

  // Заметки

  async listNotes(deckId?: string): Promise<Note[]> {
    if (deckId === undefined) return this.notes
    return this.notes.filter((note) => note.deckId === deckId)
  }

  async getNote(id: string): Promise<Note | null> {
    return this.notes.find((note) => note.id === id) ?? null
  }

  async createNote(input: NoteInput): Promise<Note> {
    const note = makeNote(input)
    this.notes.push(note)
    return note
  }

  async updateNote(id: string, patch: NotePatch): Promise<Note | null> {
    const note = this.notes.find((item) => item.id === id)
    if (!note) return null
    applyNotePatch(note, patch)
    return note
  }

  async deleteNote(id: string): Promise<boolean> {
    const index = this.notes.findIndex((note) => note.id === id)
    if (index === -1) return false
    this.notes.splice(index, 1)
    return true
  }

  // Карточки

  async listCards(filter?: CardFilter): Promise<Card[]> {
    return this.cards.filter((card) => {
      if (filter?.deckId !== undefined && card.deckId !== filter.deckId) return false
      if (filter?.noteId !== undefined && card.noteId !== filter.noteId) return false
      if (filter?.state !== undefined && card.state !== filter.state) return false
      if (filter?.includeSuspended === false && card.isSuspended) return false
      return true
    })
  }

  async getCard(id: string): Promise<Card | null> {
    return this.cards.find((card) => card.id === id) ?? null
  }

  async createCards(cards: NewCard[]): Promise<Card[]> {
    const created = makeCards(cards)
    this.cards.push(...created)
    return created
  }

  async updateCard(id: string, patch: CardPatch): Promise<Card | null> {
    const card = this.cards.find((item) => item.id === id)
    if (!card) return null
    applyCardPatch(card, patch)
    return card
  }

  async deleteCard(id: string): Promise<boolean> {
    const index = this.cards.findIndex((card) => card.id === id)
    if (index === -1) return false
    this.cards.splice(index, 1)
    return true
  }

  async deleteCardsByNote(noteId: string): Promise<void> {
    const removedIds = new Set(
      this.cards.filter((card) => card.noteId === noteId).map((card) => card.id),
    )
    for (let i = this.cards.length - 1; i >= 0; i -= 1) {
      if (this.cards[i].noteId === noteId) this.cards.splice(i, 1)
    }
    for (let i = this.reviewLogs.length - 1; i >= 0; i -= 1) {
      if (removedIds.has(this.reviewLogs[i].cardId)) this.reviewLogs.splice(i, 1)
    }
  }

  // Журнал повторений

  async createReviewLog(input: NewReviewLog): Promise<ReviewLog> {
    const log = makeReviewLog(input)
    this.reviewLogs.push(log)
    return log
  }

  async listReviewLogs(filter?: ReviewLogFilter): Promise<ReviewLog[]> {
    const deckCardIds =
      filter?.deckId === undefined
        ? null
        : new Set(this.cards.filter((card) => card.deckId === filter.deckId).map((card) => card.id))
    return this.reviewLogs.filter((log) => {
      if (filter?.cardId !== undefined && log.cardId !== filter.cardId) return false
      if (deckCardIds && !deckCardIds.has(log.cardId)) return false
      if (filter?.since !== undefined && log.reviewedAt < filter.since) return false
      return true
    })
  }

  // Результаты тренажёров

  async createTrainerResult(input: NewTrainerResult): Promise<TrainerResult> {
    const result = makeTrainerResult(input)
    this.trainerResults.push(result)
    return result
  }

  async listTrainerResults(filter?: TrainerResultFilter): Promise<TrainerResult[]> {
    return this.trainerResults.filter((result) => {
      if (filter?.trainerId !== undefined && result.trainerId !== filter.trainerId) return false
      if (filter?.since !== undefined && result.playedAt < filter.since) return false
      return true
    })
  }

  // Банк вопросов блица

  async listQuizItems(filter?: QuizItemFilter): Promise<QuizItem[]> {
    if (filter?.category === undefined) return this.quizItems
    return this.quizItems.filter((item) => item.category === filter.category)
  }
}
