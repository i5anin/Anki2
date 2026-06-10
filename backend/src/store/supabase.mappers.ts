import type { Card, CardRow } from '../domain/card.entity'
import type { Deck, DeckRow } from '../domain/deck.entity'
import type { Note, NoteRow } from '../domain/note.entity'
import type { NoteType, NoteTypeRow } from '../domain/note-type.entity'
import type { ReviewLog, ReviewLogRow } from '../domain/review-log.entity'
import type { TrainerResult, TrainerResultRow } from '../domain/trainer-result.entity'
import { mergeDeckConfig } from '../srs'

/** Мапперы строк БД (snake_case) в доменные сущности (camelCase). */

export function rowToDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    config: mergeDeckConfig(row.config),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function rowToNoteType(row: NoteTypeRow): NoteType {
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

export function rowToNote(row: NoteRow): Note {
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

export function rowToCard(row: CardRow): Card {
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

export function rowToReviewLog(row: ReviewLogRow): ReviewLog {
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

export function rowToTrainerResult(row: TrainerResultRow): TrainerResult {
  return {
    id: row.id,
    trainerId: row.trainer_id,
    skill: row.skill,
    level: row.level,
    score: row.score,
    accuracy: row.accuracy,
    durationMs: row.duration_ms,
    playedAt: row.played_at,
  }
}
