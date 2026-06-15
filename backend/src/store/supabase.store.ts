import { Injectable } from '@nestjs/common'

import type { Card, CardRow } from '../domain/card.entity'
import type { Deck, DeckRow } from '../domain/deck.entity'
import type { NoteType, NoteTypeRow } from '../domain/note-type.entity'
import type { Note, NoteRow } from '../domain/note.entity'
import type { QuizItem, QuizItemRow } from '../domain/quiz-item.entity'
import type { ReviewLog, ReviewLogRow } from '../domain/review-log.entity'
import type { TrainerResult, TrainerResultRow } from '../domain/trainer-result.entity'
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

import { mergeDeckConfig } from '../srs'
import { DataStore } from './data-store'
import { affected, maybe, one, rows } from './supabase.helpers'
import {
  rowToCard,
  rowToDeck,
  rowToNote,
  rowToNoteType,
  rowToQuizItem,
  rowToReviewLog,
  rowToTrainerResult,
} from './supabase.mappers'
import {
  cardPatchRow,
  deckInsertRow,
  deckPatchRow,
  newCardRows,
  noteInsertRow,
  notePatchRow,
  noteTypeInsertRow,
  noteTypePatchRow,
  reviewLogInsertRow,
  trainerResultInsertRow,
} from './supabase.payloads'
import { SupabaseService } from './supabase.service'

const DECKS = 'decks'
const NOTE_TYPES = 'note_types'
const NOTES = 'notes'
const CARDS = 'cards'
const REVIEW_LOGS = 'review_logs'
const TRAINER_RESULTS = 'trainer_results'
const QUIZ_QUESTIONS = 'quiz_questions'

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
    const payload = deckInsertRow(input, now())
    return rowToDeck(one<DeckRow>(await this.db.from(DECKS).insert(payload).select('*').single()))
  }

  async updateDeck(id: string, patch: DeckPatch): Promise<Deck | null> {
    const row = deckPatchRow(patch, now())
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
    const payload = noteTypeInsertRow(input, now())
    return rowToNoteType(
      one<NoteTypeRow>(await this.db.from(NOTE_TYPES).insert(payload).select('*').single()),
    )
  }

  async updateNoteType(id: string, patch: NoteTypePatch): Promise<NoteType | null> {
    const row = noteTypePatchRow(patch, now())
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
    const payload = noteInsertRow(input, now())
    return rowToNote(one<NoteRow>(await this.db.from(NOTES).insert(payload).select('*').single()))
  }

  async updateNote(id: string, patch: NotePatch): Promise<Note | null> {
    const row = notePatchRow(patch, now())
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
    const payload = newCardRows(cards, now(), mergeDeckConfig().startingEase)
    return rows<CardRow>(await this.db.from(CARDS).insert(payload).select('*')).map(rowToCard)
  }

  async updateCard(id: string, patch: CardPatch): Promise<Card | null> {
    const row = cardPatchRow(patch, now())
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
    const payload = reviewLogInsertRow(input, now())
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

  // --- Результаты тренажёров ---------------------------------------------------

  async createTrainerResult(input: NewTrainerResult): Promise<TrainerResult> {
    const payload = trainerResultInsertRow(input, now())
    return rowToTrainerResult(
      one<TrainerResultRow>(
        await this.db.from(TRAINER_RESULTS).insert(payload).select('*').single(),
      ),
    )
  }

  async listTrainerResults(filter?: TrainerResultFilter): Promise<TrainerResult[]> {
    let query = this.db.from(TRAINER_RESULTS).select('*').order('played_at', { ascending: true })
    if (filter?.trainerId !== undefined) query = query.eq('trainer_id', filter.trainerId)
    if (filter?.since !== undefined) query = query.gte('played_at', filter.since)
    return rows<TrainerResultRow>(await query).map(rowToTrainerResult)
  }

  // --- Банк вопросов блица ------------------------------------------------------

  async listQuizItems(filter?: QuizItemFilter): Promise<QuizItem[]> {
    let query = this.db.from(QUIZ_QUESTIONS).select('*')
    if (filter?.category !== undefined) query = query.eq('category', filter.category)
    return rows<QuizItemRow>(await query).map(rowToQuizItem)
  }
}
