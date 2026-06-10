import { randomUUID } from 'node:crypto'

import type { Card } from '../domain/card.entity'
import type { Deck } from '../domain/deck.entity'
import type { Note } from '../domain/note.entity'
import type { NoteType } from '../domain/note-type.entity'
import type { ReviewLog } from '../domain/review-log.entity'
import type { TrainerResult } from '../domain/trainer-result.entity'
import { DEFAULT_DECK_CONFIG, mergeDeckConfig } from '../srs'
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

/** Фабрики сущностей и применение патчей для in-memory хранилища. */

const now = (): string => new Date().toISOString()

export function makeDeck(input: DeckInput): Deck {
  const stamp = now()
  return {
    id: randomUUID(),
    name: input.name,
    description: input.description ?? '',
    config: mergeDeckConfig(input.config),
    createdAt: stamp,
    updatedAt: stamp,
  }
}

export function applyDeckPatch(deck: Deck, patch: DeckPatch): void {
  if (patch.name !== undefined) deck.name = patch.name
  if (patch.description !== undefined) deck.description = patch.description
  if (patch.config !== undefined) deck.config = mergeDeckConfig({ ...deck.config, ...patch.config })
  deck.updatedAt = now()
}

export function makeNoteType(input: NoteTypeInput): NoteType {
  const stamp = now()
  return {
    id: randomUUID(),
    name: input.name,
    fields: input.fields,
    templates: input.templates,
    isCloze: input.isCloze ?? false,
    isBuiltin: false,
    createdAt: stamp,
    updatedAt: stamp,
  }
}

export function applyNoteTypePatch(noteType: NoteType, patch: NoteTypePatch): void {
  if (patch.name !== undefined) noteType.name = patch.name
  if (patch.fields !== undefined) noteType.fields = patch.fields
  if (patch.templates !== undefined) noteType.templates = patch.templates
  if (patch.isCloze !== undefined) noteType.isCloze = patch.isCloze
  noteType.updatedAt = now()
}

export function makeNote(input: NoteInput): Note {
  const stamp = now()
  return {
    id: randomUUID(),
    noteTypeId: input.noteTypeId,
    deckId: input.deckId,
    fields: input.fields,
    tags: input.tags ?? [],
    createdAt: stamp,
    updatedAt: stamp,
  }
}

export function applyNotePatch(note: Note, patch: NotePatch): void {
  if (patch.deckId !== undefined) note.deckId = patch.deckId
  if (patch.fields !== undefined) note.fields = patch.fields
  if (patch.tags !== undefined) note.tags = patch.tags
  note.updatedAt = now()
}

export function makeCards(inputs: NewCard[]): Card[] {
  const stamp = now()
  return inputs.map<Card>((input) => ({
    id: randomUUID(),
    noteId: input.noteId,
    deckId: input.deckId,
    templateIndex: input.templateIndex,
    state: 'new',
    due: stamp,
    intervalDays: 0,
    easeFactor: DEFAULT_DECK_CONFIG.startingEase,
    reps: 0,
    lapses: 0,
    learningStep: 0,
    isSuspended: false,
    lastReviewedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  }))
}

export function applyCardPatch(card: Card, patch: CardPatch): void {
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
  card.updatedAt = now()
}

export function makeReviewLog(input: NewReviewLog): ReviewLog {
  return {
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
    reviewedAt: now(),
  }
}

export function makeTrainerResult(input: NewTrainerResult): TrainerResult {
  return {
    id: randomUUID(),
    trainerId: input.trainerId,
    skill: input.skill,
    level: input.level,
    score: input.score,
    accuracy: input.accuracy,
    durationMs: input.durationMs,
    playedAt: now(),
  }
}
