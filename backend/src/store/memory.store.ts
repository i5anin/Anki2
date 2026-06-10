import { randomUUID } from 'node:crypto'

import type { Deck } from '../domain/deck.entity'
import type { NoteType } from '../domain/note-type.entity'
import type { Note } from '../domain/note.entity'
import type { Card } from '../domain/card.entity'
import type { ReviewLog } from '../domain/review-log.entity'
import { DEFAULT_DECK_CONFIG, mergeDeckConfig } from '../srs'
import { DataStore } from './data-store'
import type {
  CardFilter,
  CardPatch,
  DeckInput,
  DeckPatch,
  NewCard,
  NewReviewLog,
  NoteInput,
  NotePatch,
  NoteTypeInput,
  NoteTypePatch,
  ReviewLogFilter,
} from './data-store'
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

  constructor() {
    super()
    const seed = createSeedData()
    this.decks = seed.decks
    this.noteTypes = seed.noteTypes
    this.notes = seed.notes
    this.cards = seed.cards
    this.reviewLogs = []
  }

  // Колоды

  async listDecks(): Promise<Deck[]> {
    return this.decks
  }

  async getDeck(id: string): Promise<Deck | null> {
    return this.decks.find((deck) => deck.id === id) ?? null
  }

  async createDeck(input: DeckInput): Promise<Deck> {
    const now = new Date().toISOString()
    const deck: Deck = {
      id: randomUUID(),
      name: input.name,
      description: input.description ?? '',
      config: mergeDeckConfig(input.config),
      createdAt: now,
      updatedAt: now,
    }
    this.decks.push(deck)
    return deck
  }

  async updateDeck(id: string, patch: DeckPatch): Promise<Deck | null> {
    const deck = this.decks.find((item) => item.id === id)
    if (!deck) return null
    if (patch.name !== undefined) deck.name = patch.name
    if (patch.description !== undefined) deck.description = patch.description
    if (patch.config !== undefined)
      deck.config = mergeDeckConfig({ ...deck.config, ...patch.config })
    deck.updatedAt = new Date().toISOString()
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
    const now = new Date().toISOString()
    const noteType: NoteType = {
      id: randomUUID(),
      name: input.name,
      fields: input.fields,
      templates: input.templates,
      isCloze: input.isCloze ?? false,
      isBuiltin: false,
      createdAt: now,
      updatedAt: now,
    }
    this.noteTypes.push(noteType)
    return noteType
  }

  async updateNoteType(id: string, patch: NoteTypePatch): Promise<NoteType | null> {
    const noteType = this.noteTypes.find((item) => item.id === id)
    if (!noteType) return null
    if (patch.name !== undefined) noteType.name = patch.name
    if (patch.fields !== undefined) noteType.fields = patch.fields
    if (patch.templates !== undefined) noteType.templates = patch.templates
    if (patch.isCloze !== undefined) noteType.isCloze = patch.isCloze
    noteType.updatedAt = new Date().toISOString()
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
    const now = new Date().toISOString()
    const note: Note = {
      id: randomUUID(),
      noteTypeId: input.noteTypeId,
      deckId: input.deckId,
      fields: input.fields,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    this.notes.push(note)
    return note
  }

  async updateNote(id: string, patch: NotePatch): Promise<Note | null> {
    const note = this.notes.find((item) => item.id === id)
    if (!note) return null
    if (patch.deckId !== undefined) note.deckId = patch.deckId
    if (patch.fields !== undefined) note.fields = patch.fields
    if (patch.tags !== undefined) note.tags = patch.tags
    note.updatedAt = new Date().toISOString()
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
    const now = new Date().toISOString()
    const created = cards.map<Card>((input) => ({
      id: randomUUID(),
      noteId: input.noteId,
      deckId: input.deckId,
      templateIndex: input.templateIndex,
      state: 'new',
      due: now,
      intervalDays: 0,
      easeFactor: DEFAULT_DECK_CONFIG.startingEase,
      reps: 0,
      lapses: 0,
      learningStep: 0,
      isSuspended: false,
      lastReviewedAt: null,
      createdAt: now,
      updatedAt: now,
    }))
    this.cards.push(...created)
    return created
  }

  async updateCard(id: string, patch: CardPatch): Promise<Card | null> {
    const card = this.cards.find((item) => item.id === id)
    if (!card) return null
    if (patch.deckId !== undefined) card.deckId = patch.deckId
    if (patch.templateIndex !== undefined) card.templateIndex = patch.templateIndex
    if (patch.state !== undefined) card.state = patch.state
    if (patch.due !== undefined) card.due = patch.due
    if (patch.intervalDays !== undefined) card.intervalDays = patch.intervalDays
    if (patch.easeFactor !== undefined) card.easeFactor = patch.easeFactor
    if (patch.reps !== undefined) card.reps = patch.reps
    if (patch.lapses !== undefined) card.lapses = patch.lapses
    if (patch.learningStep !== undefined) card.learningStep = patch.learningStep
    if (patch.isSuspended !== undefined) card.isSuspended = patch.isSuspended
    if (patch.lastReviewedAt !== undefined) card.lastReviewedAt = patch.lastReviewedAt
    card.updatedAt = new Date().toISOString()
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
    const log: ReviewLog = {
      id: randomUUID(),
      cardId: input.cardId,
      rating: input.rating,
      stateBefore: input.stateBefore,
      stateAfter: input.stateAfter,
      intervalBefore: input.intervalBefore,
      intervalAfter: input.intervalAfter,
      easeBefore: input.easeBefore,
      easeAfter: input.easeAfter,
      elapsedDays: input.elapsedDays,
      timeTakenMs: input.timeTakenMs,
      reviewedAt: new Date().toISOString(),
    }
    this.reviewLogs.push(log)
    return log
  }

  async listReviewLogs(filter?: ReviewLogFilter): Promise<ReviewLog[]> {
    const deckCardIds =
      filter?.deckId !== undefined
        ? new Set(this.cards.filter((card) => card.deckId === filter.deckId).map((card) => card.id))
        : null
    return this.reviewLogs.filter((log) => {
      if (filter?.cardId !== undefined && log.cardId !== filter.cardId) return false
      if (deckCardIds && !deckCardIds.has(log.cardId)) return false
      if (filter?.since !== undefined && log.reviewedAt < filter.since) return false
      return true
    })
  }
}
