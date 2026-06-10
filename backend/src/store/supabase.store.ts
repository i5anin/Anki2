import { Injectable, InternalServerErrorException } from '@nestjs/common'

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
import { SupabaseService } from './supabase.service'

const DECKS = 'decks'
const NOTE_TYPES = 'note_types'
const NOTES = 'notes'
const CARDS = 'cards'
const REVIEW_LOGS = 'review_logs'

@Injectable()
export class SupabaseDataStore extends DataStore {
  constructor(private readonly supabase: SupabaseService) {
    super()
  }

  // --- Мапперы: row (snake_case) -> entity (camelCase) -----------------------

  private toDeck(row: DeckRow): Deck {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      config: mergeDeckConfig(row.config),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private toNoteType(row: NoteTypeRow): NoteType {
    return {
      id: row.id,
      name: row.name,
      fields: Array.isArray(row.fields) ? row.fields : [],
      templates: Array.isArray(row.templates) ? row.templates : [],
      isCloze: row.is_cloze,
      isBuiltin: row.is_builtin,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private toNote(row: NoteRow): Note {
    return {
      id: row.id,
      noteTypeId: row.note_type_id,
      deckId: row.deck_id,
      fields: row.fields ?? {},
      tags: Array.isArray(row.tags) ? row.tags : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private toCard(row: CardRow): Card {
    return {
      id: row.id,
      noteId: row.note_id,
      deckId: row.deck_id,
      templateIndex: row.template_index,
      state: row.state,
      due: row.due,
      intervalDays: row.interval_days,
      easeFactor: row.ease_factor,
      reps: row.reps,
      lapses: row.lapses,
      learningStep: row.learning_step,
      isSuspended: row.is_suspended,
      lastReviewedAt: row.last_reviewed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  private toReviewLog(row: ReviewLogRow): ReviewLog {
    return {
      id: row.id,
      cardId: row.card_id,
      rating: row.rating,
      stateBefore: row.state_before,
      stateAfter: row.state_after,
      intervalBefore: row.interval_before,
      intervalAfter: row.interval_after,
      easeBefore: row.ease_before,
      easeAfter: row.ease_after,
      elapsedDays: row.elapsed_days,
      timeTakenMs: row.time_taken_ms,
      reviewedAt: row.reviewed_at,
    }
  }

  // --- Колоды ----------------------------------------------------------------

  async listDecks(): Promise<Deck[]> {
    const { data, error } = await this.supabase.client
      .from(DECKS)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new InternalServerErrorException(error.message)
    return (data as DeckRow[]).map((row) => this.toDeck(row))
  }

  async getDeck(id: string): Promise<Deck | null> {
    const { data, error } = await this.supabase.client
      .from(DECKS)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toDeck(data as DeckRow)
  }

  async createDeck(input: DeckInput): Promise<Deck> {
    const config = mergeDeckConfig(input.config)
    const now = new Date().toISOString()
    const payload = {
      name: input.name,
      description: input.description ?? '',
      config: config as unknown as Record<string, unknown>,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await this.supabase.client
      .from(DECKS)
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new InternalServerErrorException(error.message)
    return this.toDeck(data as DeckRow)
  }

  async updateDeck(id: string, patch: DeckPatch): Promise<Deck | null> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.name !== undefined) row.name = patch.name
    if (patch.description !== undefined) row.description = patch.description
    if (patch.config !== undefined) row.config = mergeDeckConfig(patch.config)

    const { data, error } = await this.supabase.client
      .from(DECKS)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toDeck(data as DeckRow)
  }

  async deleteDeck(id: string): Promise<boolean> {
    const { data, error } = await this.supabase.client
      .from(DECKS)
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw new InternalServerErrorException(error.message)
    return (data as { id: string }[]).length > 0
  }

  // --- Модели заметок --------------------------------------------------------

  async listNoteTypes(): Promise<NoteType[]> {
    const { data, error } = await this.supabase.client
      .from(NOTE_TYPES)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new InternalServerErrorException(error.message)
    return (data as NoteTypeRow[]).map((row) => this.toNoteType(row))
  }

  async getNoteType(id: string): Promise<NoteType | null> {
    const { data, error } = await this.supabase.client
      .from(NOTE_TYPES)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toNoteType(data as NoteTypeRow)
  }

  async createNoteType(input: NoteTypeInput): Promise<NoteType> {
    const now = new Date().toISOString()
    const payload = {
      name: input.name,
      fields: input.fields,
      templates: input.templates,
      is_cloze: input.isCloze ?? false,
      is_builtin: false,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await this.supabase.client
      .from(NOTE_TYPES)
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new InternalServerErrorException(error.message)
    return this.toNoteType(data as NoteTypeRow)
  }

  async updateNoteType(id: string, patch: NoteTypePatch): Promise<NoteType | null> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.name !== undefined) row.name = patch.name
    if (patch.fields !== undefined) row.fields = patch.fields
    if (patch.templates !== undefined) row.templates = patch.templates
    if (patch.isCloze !== undefined) row.is_cloze = patch.isCloze

    const { data, error } = await this.supabase.client
      .from(NOTE_TYPES)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toNoteType(data as NoteTypeRow)
  }

  async deleteNoteType(id: string): Promise<boolean> {
    const { data, error } = await this.supabase.client
      .from(NOTE_TYPES)
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw new InternalServerErrorException(error.message)
    return (data as { id: string }[]).length > 0
  }

  // --- Заметки ---------------------------------------------------------------

  async listNotes(deckId?: string): Promise<Note[]> {
    let query = this.supabase.client
      .from(NOTES)
      .select('*')
      .order('created_at', { ascending: true })

    if (deckId !== undefined) query = query.eq('deck_id', deckId)

    const { data, error } = await query
    if (error) throw new InternalServerErrorException(error.message)
    return (data as NoteRow[]).map((row) => this.toNote(row))
  }

  async getNote(id: string): Promise<Note | null> {
    const { data, error } = await this.supabase.client
      .from(NOTES)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toNote(data as NoteRow)
  }

  async createNote(input: NoteInput): Promise<Note> {
    const now = new Date().toISOString()
    const payload = {
      note_type_id: input.noteTypeId,
      deck_id: input.deckId,
      fields: input.fields,
      tags: input.tags ?? [],
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await this.supabase.client
      .from(NOTES)
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new InternalServerErrorException(error.message)
    return this.toNote(data as NoteRow)
  }

  async updateNote(id: string, patch: NotePatch): Promise<Note | null> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.deckId !== undefined) row.deck_id = patch.deckId
    if (patch.fields !== undefined) row.fields = patch.fields
    if (patch.tags !== undefined) row.tags = patch.tags

    const { data, error } = await this.supabase.client
      .from(NOTES)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toNote(data as NoteRow)
  }

  async deleteNote(id: string): Promise<boolean> {
    const { data, error } = await this.supabase.client
      .from(NOTES)
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw new InternalServerErrorException(error.message)
    return (data as { id: string }[]).length > 0
  }

  // --- Карточки --------------------------------------------------------------

  async listCards(filter?: CardFilter): Promise<Card[]> {
    let query = this.supabase.client
      .from(CARDS)
      .select('*')
      .order('created_at', { ascending: true })

    if (filter?.deckId !== undefined) query = query.eq('deck_id', filter.deckId)
    if (filter?.noteId !== undefined) query = query.eq('note_id', filter.noteId)
    if (filter?.state !== undefined) query = query.eq('state', filter.state)
    if (filter?.includeSuspended === false) query = query.eq('is_suspended', false)

    const { data, error } = await query
    if (error) throw new InternalServerErrorException(error.message)
    return (data as CardRow[]).map((row) => this.toCard(row))
  }

  async getCard(id: string): Promise<Card | null> {
    const { data, error } = await this.supabase.client
      .from(CARDS)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toCard(data as CardRow)
  }

  async createCards(cards: NewCard[]): Promise<Card[]> {
    if (cards.length === 0) return []

    const startingEase = mergeDeckConfig().startingEase
    const now = new Date().toISOString()
    const rows = cards.map((card) => ({
      note_id: card.noteId,
      deck_id: card.deckId,
      template_index: card.templateIndex,
      state: 'new',
      due: now,
      interval_days: 0,
      ease_factor: startingEase,
      reps: 0,
      lapses: 0,
      learning_step: 0,
      is_suspended: false,
      last_reviewed_at: null,
      created_at: now,
      updated_at: now,
    }))

    const { data, error } = await this.supabase.client.from(CARDS).insert(rows).select('*')

    if (error) throw new InternalServerErrorException(error.message)
    return (data as CardRow[]).map((row) => this.toCard(row))
  }

  async updateCard(id: string, patch: CardPatch): Promise<Card | null> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
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

    const { data, error } = await this.supabase.client
      .from(CARDS)
      .update(row)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw new InternalServerErrorException(error.message)
    if (!data) return null
    return this.toCard(data as CardRow)
  }

  async deleteCard(id: string): Promise<boolean> {
    const { data, error } = await this.supabase.client
      .from(CARDS)
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw new InternalServerErrorException(error.message)
    return (data as { id: string }[]).length > 0
  }

  async deleteCardsByNote(noteId: string): Promise<void> {
    const { error } = await this.supabase.client.from(CARDS).delete().eq('note_id', noteId)
    if (error) throw new InternalServerErrorException(error.message)
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
      reviewed_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase.client
      .from(REVIEW_LOGS)
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new InternalServerErrorException(error.message)
    return this.toReviewLog(data as ReviewLogRow)
  }

  async listReviewLogs(filter?: ReviewLogFilter): Promise<ReviewLog[]> {
    let cardIds: string[] | null = null

    // deckId не хранится в журнале — собираем id карточек колоды и фильтруем по ним.
    if (filter?.deckId !== undefined) {
      const { data, error } = await this.supabase.client
        .from(CARDS)
        .select('id')
        .eq('deck_id', filter.deckId)

      if (error) throw new InternalServerErrorException(error.message)
      cardIds = (data as { id: string }[]).map((row) => row.id)
      if (cardIds.length === 0) return []
    }

    let query = this.supabase.client
      .from(REVIEW_LOGS)
      .select('*')
      .order('reviewed_at', { ascending: true })

    if (filter?.cardId !== undefined) query = query.eq('card_id', filter.cardId)
    if (cardIds !== null) query = query.in('card_id', cardIds)
    if (filter?.since !== undefined) query = query.gte('reviewed_at', filter.since)

    const { data, error } = await query
    if (error) throw new InternalServerErrorException(error.message)
    return (data as ReviewLogRow[]).map((row) => this.toReviewLog(row))
  }
}
