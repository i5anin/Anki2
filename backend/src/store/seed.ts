import type { Card } from '../domain/card.entity'
import type { Deck } from '../domain/deck.entity'
import type { NoteType } from '../domain/note-type.entity'
import type { Note } from '../domain/note.entity'
import type { QuizItem } from '../domain/quiz-item.entity'

import { DEFAULT_DECK_CONFIG } from '../srs'
import { createInterviewSeedData } from './interview.seed'
import { createQuizBankSeed } from './quiz-bank.seed'

/**
 * Демонстрационные данные для офлайн-режима (MemoryDataStore). Совпадают с
 * supabase/seed.sql по идентификаторам и содержимому, поэтому переключение на
 * Supabase бесшовно. Возвращаются глубокие копии — стор может мутировать их.
 */

const T = '2026-01-01T00:00:00.000Z'

const NOTE_TYPES: NoteType[] = [
  {
    id: '11111111-1111-1111-1111-111111110001',
    name: 'Basic',
    fields: ['Front', 'Back'],
    templates: [{ name: 'Card 1', front: '{{Front}}', back: '{{FrontSide}}\n\n---\n\n{{Back}}' }],
    isCloze: false,
    isBuiltin: true,
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '11111111-1111-1111-1111-111111110002',
    name: 'Basic (and reversed)',
    fields: ['Front', 'Back'],
    templates: [
      { name: 'Card 1', front: '{{Front}}', back: '{{FrontSide}}\n\n---\n\n{{Back}}' },
      { name: 'Card 2', front: '{{Back}}', back: '{{FrontSide}}\n\n---\n\n{{Front}}' },
    ],
    isCloze: false,
    isBuiltin: true,
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '11111111-1111-1111-1111-111111110003',
    name: 'Cloze',
    fields: ['Text', 'Extra'],
    templates: [{ name: 'Cloze', front: '{{cloze:Text}}', back: '{{cloze:Text}}\n\n{{Extra}}' }],
    isCloze: true,
    isBuiltin: true,
    createdAt: T,
    updatedAt: T,
  },
]

const DECKS: Deck[] = [
  {
    id: '22222222-2222-2222-2222-222222220001',
    name: 'Default',
    description: 'Колода по умолчанию',
    config: { ...DEFAULT_DECK_CONFIG },
    createdAt: T,
    updatedAt: T,
  },
]

const NOTES: Note[] = [
  {
    id: '33333333-3333-3333-3333-333333330001',
    noteTypeId: '11111111-1111-1111-1111-111111110001',
    deckId: '22222222-2222-2222-2222-222222220001',
    fields: { Front: 'Столица Франции?', Back: '**Париж**' },
    tags: ['geo'],
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '33333333-3333-3333-3333-333333330002',
    noteTypeId: '11111111-1111-1111-1111-111111110001',
    deckId: '22222222-2222-2222-2222-222222220001',
    fields: { Front: 'Теорема Пифагора', Back: '$c^2 = a^2 + b^2$' },
    tags: ['math'],
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '33333333-3333-3333-3333-333333330003',
    noteTypeId: '11111111-1111-1111-1111-111111110001',
    deckId: '22222222-2222-2222-2222-222222220001',
    fields: { Front: 'JavaScript: объявление константы', Back: '```js\nconst answer = 42\n```' },
    tags: ['js', 'code'],
    createdAt: T,
    updatedAt: T,
  },
  {
    id: '33333333-3333-3333-3333-333333330004',
    noteTypeId: '11111111-1111-1111-1111-111111110003',
    deckId: '22222222-2222-2222-2222-222222220001',
    fields: {
      Text: 'Столица Японии — {{c1::Токио}}.',
      Extra: 'Население агломерации ~37 млн.',
    },
    tags: ['geo'],
    createdAt: T,
    updatedAt: T,
  },
]

function newCard(id: string, noteId: string): Card {
  return {
    id,
    noteId,
    deckId: '22222222-2222-2222-2222-222222220001',
    templateIndex: 0,
    state: 'new',
    due: T,
    intervalDays: 0,
    easeFactor: DEFAULT_DECK_CONFIG.startingEase,
    reps: 0,
    lapses: 0,
    learningStep: 0,
    isSuspended: false,
    lastReviewedAt: null,
    createdAt: T,
    updatedAt: T,
  }
}

const CARDS: Card[] = [
  newCard('44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001'),
  newCard('44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-333333330002'),
  newCard('44444444-4444-4444-4444-444444440003', '33333333-3333-3333-3333-333333330003'),
  newCard('44444444-4444-4444-4444-444444440004', '33333333-3333-3333-3333-333333330004'),
]

export interface SeedData {
  noteTypes: NoteType[]
  decks: Deck[]
  notes: Note[]
  cards: Card[]
  quizItems: QuizItem[]
}

/** Свежая глубокая копия демо-данных (колоды + банк вопросов блица). */
export function createSeedData(): SeedData {
  const interview = createInterviewSeedData()
  return structuredClone({
    noteTypes: NOTE_TYPES,
    decks: [...DECKS, ...interview.decks],
    notes: [...NOTES, ...interview.notes],
    cards: [...CARDS, ...interview.cards],
    quizItems: createQuizBankSeed(),
  })
}
