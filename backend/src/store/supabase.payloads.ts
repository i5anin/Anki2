import type {
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
} from './data-store'

import { mergeDeckConfig } from '../srs'

/** Построители insert/update-строк (snake_case) для Supabase-хранилища. */

type Row = Record<string, unknown>

export function deckInsertRow(input: DeckInput, stamp: string): Row {
  return {
    name: input.name,
    description: input.description ?? '',
    config: mergeDeckConfig(input.config),
    created_at: stamp,
    updated_at: stamp,
  }
}

export function deckPatchRow(patch: DeckPatch, stamp: string): Row {
  const row: Row = { updated_at: stamp }
  if (patch.name !== undefined) row.name = patch.name
  if (patch.description !== undefined) row.description = patch.description
  if (patch.config !== undefined) row.config = mergeDeckConfig(patch.config)
  return row
}

export function noteTypeInsertRow(input: NoteTypeInput, stamp: string): Row {
  return {
    name: input.name,
    fields: input.fields,
    templates: input.templates,
    is_cloze: input.isCloze ?? false,
    is_builtin: false,
    created_at: stamp,
    updated_at: stamp,
  }
}

export function noteTypePatchRow(patch: NoteTypePatch, stamp: string): Row {
  const row: Row = { updated_at: stamp }
  if (patch.name !== undefined) row.name = patch.name
  if (patch.fields !== undefined) row.fields = patch.fields
  if (patch.templates !== undefined) row.templates = patch.templates
  if (patch.isCloze !== undefined) row.is_cloze = patch.isCloze
  return row
}

export function noteInsertRow(input: NoteInput, stamp: string): Row {
  return {
    note_type_id: input.noteTypeId,
    deck_id: input.deckId,
    fields: input.fields,
    tags: input.tags ?? [],
    created_at: stamp,
    updated_at: stamp,
  }
}

export function notePatchRow(patch: NotePatch, stamp: string): Row {
  const row: Row = { updated_at: stamp }
  if (patch.deckId !== undefined) row.deck_id = patch.deckId
  if (patch.fields !== undefined) row.fields = patch.fields
  if (patch.tags !== undefined) row.tags = patch.tags
  return row
}

export function newCardRows(cards: NewCard[], stamp: string, startingEase: number): Row[] {
  return cards.map((card) => ({
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
}

export function cardPatchRow(patch: CardPatch, stamp: string): Row {
  const row: Row = { updated_at: stamp }
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
  return row
}

export function reviewLogInsertRow(input: NewReviewLog, stamp: string): Row {
  return {
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
    reviewed_at: stamp,
  }
}

export function trainerResultInsertRow(input: NewTrainerResult, stamp: string): Row {
  return {
    trainer_id: input.trainerId,
    skill: input.skill,
    level: input.level,
    score: input.score,
    accuracy: input.accuracy,
    duration_ms: input.durationMs,
    played_at: stamp,
  }
}
