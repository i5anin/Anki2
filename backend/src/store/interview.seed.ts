import { createHash } from 'node:crypto'

import type { Card } from '../domain/card.entity'
import type { Deck } from '../domain/deck.entity'
import type { Note } from '../domain/note.entity'
import { mergeDeckConfig } from '../srs'

import analysisCards from './interview/analysis.json'
import blitzCards from './interview/blitz.json'
import cssCards from './interview/css.json'
import infraCards from './interview/infra.json'
import jsCards from './interview/js.json'
import managementCards from './interview/management.json'
import systemDesignCards from './interview/system-design.json'
import tsCards from './interview/ts.json'
import vueCards from './interview/vue.json'

interface InterviewCard {
  front: string
  back: string
  tags: string[]
}

interface InterviewDeck {
  slug: string
  id: string
  name: string
  description: string
  cards: InterviewCard[]
}

const BASIC_NOTE_TYPE = '11111111-1111-1111-1111-111111110001'
const T = '2026-01-01T00:00:00.000Z'

// Спринт-конфиг подготовки: выше дневные лимиты, остальное — дефолт SM-2.
const SPRINT_CONFIG = { newCardsPerDay: 30, maxReviewsPerDay: 300 }

/** Колоды «Собеседование». UUID фиксированы и совпадают с supabase/seed-interview.sql. */
const INTERVIEW_DECKS: InterviewDeck[] = [
  { slug: 'blitz', id: '55555555-5555-5555-5555-555555550009', name: 'Блиц · Короткие факты', description: 'Короткие вопросы для разминки-блица (варианты + таймер) перед глубокими колодами', cards: blitzCards },
  { slug: 'js', id: '55555555-5555-5555-5555-555555550001', name: 'Собеседование · JavaScript', description: 'Подготовка к собеседованию: JavaScript', cards: jsCards },
  { slug: 'ts', id: '55555555-5555-5555-5555-555555550002', name: 'Собеседование · TypeScript', description: 'Подготовка к собеседованию: TypeScript', cards: tsCards },
  { slug: 'css', id: '55555555-5555-5555-5555-555555550003', name: 'Собеседование · HTML / CSS', description: 'Подготовка к собеседованию: вёрстка, CSS, браузер', cards: cssCards },
  { slug: 'vue', id: '55555555-5555-5555-5555-555555550004', name: 'Собеседование · Vue 3', description: 'Подготовка к собеседованию: Vue', cards: vueCards },
  { slug: 'system-design', id: '55555555-5555-5555-5555-555555550005', name: 'Собеседование · Системный дизайн', description: 'Подготовка к собеседованию: системный дизайн', cards: systemDesignCards },
  { slug: 'infra', id: '55555555-5555-5555-5555-555555550006', name: 'Собеседование · Инфраструктура и безопасность', description: 'Подготовка: сборка, CI/CD, авторизация, безопасность', cards: infraCards },
  { slug: 'analysis', id: '55555555-5555-5555-5555-555555550007', name: 'Собеседование · Анализ и проектирование', description: 'Подготовка: анализ, оценка, проектирование', cards: analysisCards },
  { slug: 'management', id: '55555555-5555-5555-5555-555555550008', name: 'Собеседование · Организация и управление', description: 'Подготовка: лид, команда, интервью', cards: managementCards },
]

/** Детерминированный UUID (8-4-4-4-12) — тот же алгоритм, что в build-interview.mjs. */
function uuid5(name: string): string {
  const h = createHash('sha1').update(`anki-interview:${name}`).digest('hex').slice(0, 32)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

export interface InterviewSeedData {
  decks: Deck[]
  notes: Note[]
  cards: Card[]
}

/** Колоды «Собеседование» для демо-режима (зеркало seed-interview.sql). */
export function createInterviewSeedData(): InterviewSeedData {
  const decks: Deck[] = []
  const notes: Note[] = []
  const cards: Card[] = []

  for (const deck of INTERVIEW_DECKS) {
    decks.push({
      id: deck.id,
      name: deck.name,
      description: deck.description,
      config: mergeDeckConfig(SPRINT_CONFIG),
      createdAt: T,
      updatedAt: T,
    })

    deck.cards.forEach((card, i) => {
      const noteId = uuid5(`${deck.slug}:note:${i}`)
      notes.push({
        id: noteId,
        noteTypeId: BASIC_NOTE_TYPE,
        deckId: deck.id,
        fields: { Front: card.front, Back: card.back },
        tags: card.tags,
        createdAt: T,
        updatedAt: T,
      })
      cards.push({
        id: uuid5(`${deck.slug}:card:${i}`),
        noteId,
        deckId: deck.id,
        templateIndex: 0,
        state: 'new',
        due: T,
        intervalDays: 0,
        easeFactor: 2.5,
        reps: 0,
        lapses: 0,
        learningStep: 0,
        isSuspended: false,
        lastReviewedAt: null,
        createdAt: T,
        updatedAt: T,
      })
    })
  }

  return { decks, notes, cards }
}
