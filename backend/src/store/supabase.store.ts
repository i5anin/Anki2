import { Injectable } from '@nestjs/common'

import type { Card, CardRow } from '../domain/card.entity'
import type { Deck, DeckRow } from '../domain/deck.entity'
import type { Note, NoteRow } from '../domain/note.entity'
import type { NoteType, NoteTypeRow } from '../domain/note-type.entity'
import type { ReviewLog, ReviewLogRow } from '../domain/review-log.entity'
import { mergeDeckConfig } from '../srs'
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
import { affected, maybe, one, rows } from './supabase.helpers'
import {
  rowToCard,
  rowToDeck,
  rowToNote,
  rowToNoteType,
  rowToReviewLog,
} from './supabase.mappers'
import { SupabaseService } from './supabase.service'

const DECKS = 'decks'
const NOTE_TYPES = 'note_types'
const NOTES = 'notes'
const CARDS = 'cards'
const REVIEW_LOGS = 'review_logs'

const now = (): string => new Date().toISOString()

@Injectable()
export class SupabaseDataStore extends DataStore {
  constructor(private readonly supabase: SupabaseService) {
    super()
  }

  private get db(): SupabaseService['client'] {
    return this.supabase.client
  }

  // --- Колоды ----------------------------------------------------------------

  async listDecks(): Promise<Deck[]> {
    const res = await this.db.from(DECKS).select('*').order('created_at', { ascending: true })
    return rows<DeckRow>(res).map(rowToDeck)
  }

  async getDeck(id: string): Promise<Deck | null> {
    const row = maybe<DeckRow>(await this.db.from(DECKS).select('*').eq('id', id).maybeSingle())
    return row ? rowToDeck(row) : null
  }

  async createDeck(input: DeckInput): Promise<Deck> {
    const stamp = now()
    const payload = {
      name: input.name,
      description: input.description ?? '',
      config: mergeDeckConfig(input.config),
      created_at: stamp,
      updated_at: stamp,
    }
    return rowToDeck(one<DeckRow>(await this.db.from(DECKS).insert(payload).select('*').single()))
  }

  async updateDeck(id: string, patch: DeckPatch): Promise<Deck | null> {
    const row: Record<string, unknown> = { updated_at: now() }
    if (patch.name !== undefined) row.name = patch.name
    if (patch.description !== undefined) row.description = patch.description
    if (patch.config !== undefined) row.config = mergeDeckConfig(patch.config)
    const updated = maybe<DeckRow>(
      await this.db.from(DECKS).update(row).eq('id', id).select('*').maybeSingle(),
    )
    return updated ? rowToDeck(updated) : null
  }

  async deleteDeck(id: string): Promise<boolean> {
    return affected(await this.db.from(DECKS).delete().eq('id', id).select('id'))
  }

  // --- Модели заметок --------------------------------------------------------

  async listNoteTypes(): Promise<NoteType[]> {
    const res = await this.db.from(NOTE_TYPES).select('*').order('created_at', { ascending: true })
    return rows<NoteTypeRow>(res).map(rowToNoteType)
  }

  async getNoteType(id: string): Promise<NoteType | null> {
    const row = maybe<NoteTypeRow>(
      await this.db.from(NOTE_TYPES).select('*').eq('id', id).maybeSingle(),
    )
    return row ? rowToNoteType(row) : null
  }

  async createNoteType(input: NoteTypeInput): Promise<NoteType> {
    const stamp = now()
    const payload = {
      name: input.name,
      fields: input.fields,
      templates: input.templates,
      is_cloze: input.isCloze ?? false,
      is_builtin: false,
      created_at: stamp,
      updated_at: stamp,
    }
    return rowToNoteType(
      one<NoteTypeRow>(await this.db.from(NOTE_TYPES).insert(payload).select('*').single()),
    )
  }

  async updateNoteType(id: string, patch: NoteTypePatch): Promise<NoteType | null> {
    const row: Record<string, unknown> = { updated_at: now() }
    if (patch.name !== undefined) row.name = patch.name
    if (patch.fields !== undefined) row.fields = patch.fields
    if (patch.templates !== undefined) row.templates = patch.templates
    if (patch.isCloze !== undefined) row.is_cloze = patch.isCloze
    const updated = maybe<NoteTypeRow>(
      await this.db.from(NOTE_TYPES).update(row).eq('id', id).select('*').maybeSingle(),
    )
    return updated ? rowToNoteType(updated) : null
  }

  async deleteNoteType(id: string): Promise<boolean> {
    return affected(await this.db.from(NOTE_TYPES).delete().eq('id', id).select('id'))
  }

  // --- Заметки ---------------------------------------------------------------

  async listNotes(deckId?: string): Promise<Note[]> {
    let query = this.db.from(NOTES).select('*').order('created_at', { ascending: true })
    if (deckId !== undefined) query = query.eq('deck_id', deckId)
    return rows<NoteRow>(await query).map(rowToNote)
  }

  async getNote(id: string): Promise<Note | null> {
    const row = maybe<NoteRow>(await this.db.from(NOTES).select('*').eq('id', id).maybeSingle())
    return row ? rowToNote(row) : null
  }

  async createNote(input: NoteInput): Promise<Note> {
    const stamp = now()
    const payload = {
      note_type_id: input.noteTypeId,
      deck_id: input.deckId,
      fields: input.fields,
      tags: input.tags ?? [],
      created_at: stamp,
      updated_at: stamp,
    }
    return rowToNote(one<NoteRow>(await this.db.from(NOTES).insert(payload).select('*').single()))
  }

  async updateNote(id: string, patch: NotePatch): Promise<Note | null> {
    const row: Record<string, unknown> = { updated_at: now() }
    if (patch.deckId !== undefined) row.deck_id = patch.deckId
    if (patch.fields !== undefined) row.fields = patch.fields
    if (patch.tags !== undefined) row.tags = patch.tags
    const updated = maybe<NoteRow>(
      await this.db.from(NOTES).update(row).eq('id', id).select('*').maybeSingle(),
    )
    return updated ? rowToNote(updated) : null
  }

  async deleteNote(id: string): Promise<boolean> {
    return affected(await this.db.from(NOTES).delete().eq('id', id).select('id'))
  }

  // --- Карточки --------------------------------------------------------------

  async listCards(filter?: CardFilter): Promise<Card[]> {
    let query = this.db.from(CARDS).select('*').order('created_at', { ascending: true })
    if (filter?.deckId !== undefined) query = query.eq('deck_id', filter.deckId)
    if (filter?.noteId !== undefined) query = query.eq('note_id', filter.noteId)
    if (filter?.state !== undefined) query = query.eq('state', filter.state)
    if (filter?.includeSuspended === false) query = query.eq('is_suspended', false)
    return rows<CardRow>(await query).map(rowToCard)
  }

  async getCard(id: string): Promise<Card | null> {
    const row = maybe<CardRow>(await this.db.from(CARDS).select('*').eq('id', id).maybeSingle())
    return row ? rowToCard(row) : null
  }

  async createCards(cards: NewCard[]): Promise<Card[]> {
    if (cards.length === 0) {
      return []
    }
    const stamp = now()
    const startingEase = mergeDeckConfig().startingEase
    const payload = cards.map((card) => ({
      note_id: card.noteId,
      deck_id: card.deckId,
      template_index: card.templateIndex,
      state: 'new',
      due: stamp,
      interval_days: 0,
      ease_factor: startingEase,
      reps: 0,
      lapses: 0,
      learning_step: 0,
      is_suspended: false,
      last_reviewed_at: null,
      created_at: stamp,
      updated_at: stamp,
    }))
    return rows<CardRow>(await this.db.from(CARDS).insert(payload).select('*')).map(rowToCard)
  }

  async updateCard(id: string, patch: CardPatch): Promise<Card | null> {
    const row: Record<string, unknown> = { updated_at: now() }
    if (patch.deckId !== undefined) row.deck_id = patch.deckId
    if (patch.templateIndex !== undefined) row.template_index = patch.templateIndex
    if (patch.state !== undefined) row.state = patch.state
    if (patch.due !== undefined) row.due = patch.due
    if (patch.intervalDays !== undefined) row.interval_days = patch.intervalDays
    if (patch.easeFactor !== undefined) row.ease_factor = patch.easeFactor
    if (patch.reps !== undefined) row.reps = patch.reps
    if (patch.lapses !== undefined) row.lapses = patch.lapses
    if (patch.learningStep !== undefined) row.learning_step = patch.learningStep
    if (patch.isSuspended !== undefined) row.is_suspended = patch.isSuspended
    if (patch.lastReviewedAt !== undefined) row.last_reviewed_at = patch.lastReviewedAt
    const updated = maybe<CardRow>(
      await this.db.from(CARDS).update(row).eq('id', id).select('*').maybeSingle(),
    )
    return updated ? rowToCard(updated) : null
  }

  async deleteCard(id: string): Promise<boolean> {
    return affected(await this.db.from(CARDS).delete().eq('id', id).select('id'))
  }

  async deleteCardsByNote(noteId: string): Promise<void> {
    const { error } = await this.db.from(CARDS).delete().eq('note_id', noteId)
    if (error) {
      throw new Error(error.message)
    }
  }

  // --- Журнал повторений -----------------------------------------------------

  async createReviewLog(input: NewReviewLog): Promise<ReviewLog> {
    const payload = {
      card_id: input.cardId,
      rating: input.rating,
      state_before: input.stateBefore,
      state_after: input.stateAfter,
      interval_before: input.intervalBefore,
      interval_after: input.intervalAfter,
      ease_before: input.easeBefore,
      ease_after: input.easeAfter,
      elapsed_days: input.elapsedDays,
      time_taken_ms: input.timeTakenMs,
      reviewed_at: now(),
    }
    return rowToReviewLog(
      one<ReviewLogRow>(await this.db.from(REVIEW_LOGS).insert(payload).select('*').single()),
    )
  }

  async listReviewLogs(filter?: ReviewLogFilter): Promise<ReviewLog[]> {
    let cardIds: string[] | null = null

    // deckId не хранится в журнале — собираем id карточек колоды и фильтруем по ним.
    if (filter?.deckId !== undefined) {
      const ids = rows<{ id: string }>(
        await this.db.from(CARDS).select('id').eq('deck_id', filter.deckId),
      )
      if (ids.length === 0) {
        return []
      }
      cardIds = ids.map((row) => row.id)
    }

    let query = this.db.from(REVIEW_LOGS).select('*').order('reviewed_at', { ascending: true })
    if (filter?.cardId !== undefined) query = query.eq('card_id', filter.cardId)
    if (cardIds !== null) query = query.in('card_id', cardIds)
    if (filter?.since !== undefined) query = query.gte('reviewed_at', filter.since)

    return rows<ReviewLogRow>(await query).map(rowToReviewLog)
  }
}
