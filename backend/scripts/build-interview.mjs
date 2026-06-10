// Генератор колоды «Собеседование» из JSON-карточек (по областям) в SQL-сид
// для Supabase. Запуск:  node backend/scripts/build-interview.mjs
//
// Читает backend/src/store/interview/<slug>.json (массивы { front, back, tags }),
// пишет supabase/seed-interview.sql. UUID детерминированы (re-run идемпотентен).

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..', '..') // .../Anki2
const INTERVIEW_DIR = resolve(ROOT, 'backend', 'src', 'store', 'interview')
const OUT = resolve(ROOT, 'supabase', 'seed-interview.sql')

const BASIC_NOTE_TYPE = '11111111-1111-1111-1111-111111110001'

/** Области → метаданные колоды (стабильные UUID). */
const DECKS = [
  { slug: 'js', id: '55555555-5555-5555-5555-555555550001', name: 'Собеседование · JavaScript', description: 'Подготовка к собеседованию: JavaScript' },
  { slug: 'ts', id: '55555555-5555-5555-5555-555555550002', name: 'Собеседование · TypeScript', description: 'Подготовка к собеседованию: TypeScript' },
  { slug: 'css', id: '55555555-5555-5555-5555-555555550003', name: 'Собеседование · HTML / CSS', description: 'Подготовка к собеседованию: вёрстка, CSS, браузер' },
  { slug: 'vue', id: '55555555-5555-5555-5555-555555550004', name: 'Собеседование · Vue 3', description: 'Подготовка к собеседованию: Vue' },
  { slug: 'system-design', id: '55555555-5555-5555-5555-555555550005', name: 'Собеседование · Системный дизайн', description: 'Подготовка к собеседованию: системный дизайн' },
  { slug: 'infra', id: '55555555-5555-5555-5555-555555550006', name: 'Собеседование · Инфраструктура и безопасность', description: 'Подготовка: сборка, CI/CD, авторизация, безопасность' },
  { slug: 'analysis', id: '55555555-5555-5555-5555-555555550007', name: 'Собеседование · Анализ и проектирование', description: 'Подготовка: анализ, оценка, проектирование' },
  { slug: 'management', id: '55555555-5555-5555-5555-555555550008', name: 'Собеседование · Организация и управление', description: 'Подготовка: лид, команда, интервью' },
]

/** Детерминированный UUID (формат 8-4-4-4-12) из строки. */
function uuid5(name) {
  const h = createHash('sha1').update(`anki-interview:${name}`).digest('hex').slice(0, 32)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/** Строка → SQL-литерал (экранирование одинарных кавычек). */
function lit(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

/** Postgres text[] литерал. */
function pgArray(values) {
  if (!Array.isArray(values) || values.length === 0) return "'{}'"
  return `ARRAY[${values.map((v) => lit(v)).join(', ')}]::text[]`
}

const lines = []
lines.push('-- ============================================================================')
lines.push('-- Anki2 — колоды «Собеседование» (Frontend). Сгенерировано build-interview.mjs.')
lines.push('-- Применять ПОСЛЕ schema.sql и seed.sql. Идемпотентно (on conflict do nothing).')
lines.push('-- ============================================================================')
lines.push('begin;')
lines.push('')

let total = 0
const report = []

for (const deck of DECKS) {
  const file = resolve(INTERVIEW_DIR, `${deck.slug}.json`)
  let cards
  try {
    cards = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`!! ${deck.slug}: не удалось прочитать/распарсить ${file}: ${e.message}`)
    process.exitCode = 1
    continue
  }
  if (!Array.isArray(cards)) {
    console.error(`!! ${deck.slug}: ожидался массив`)
    process.exitCode = 1
    continue
  }

  // Спринт-конфиг подготовки (тот же, что в interview.seed.ts).
  const config = JSON.stringify({ newCardsPerDay: 30, maxReviewsPerDay: 300 })
  lines.push(`-- ${deck.name} (${cards.length})`)
  lines.push(
    `insert into anki.decks (id, name, description, config) values (${lit(deck.id)}, ${lit(deck.name)}, ${lit(deck.description)}, ${lit(config)}::jsonb) on conflict (id) do nothing;`,
  )

  cards.forEach((card, i) => {
    const noteId = uuid5(`${deck.slug}:note:${i}`)
    const cardId = uuid5(`${deck.slug}:card:${i}`)
    const fields = JSON.stringify({ Front: String(card.front ?? ''), Back: String(card.back ?? '') })
    const tags = pgArray(card.tags)
    lines.push(
      `insert into anki.notes (id, note_type_id, deck_id, fields, tags) values (${lit(noteId)}, ${lit(BASIC_NOTE_TYPE)}, ${lit(deck.id)}, ${lit(fields)}::jsonb, ${tags}) on conflict (id) do nothing;`,
    )
    lines.push(
      `insert into anki.cards (id, note_id, deck_id, template_index, state) values (${lit(cardId)}, ${lit(noteId)}, ${lit(deck.id)}, 0, 'new') on conflict (id) do nothing;`,
    )
  })
  lines.push('')
  total += cards.length
  report.push(`${deck.slug}: ${cards.length}`)
}

lines.push('commit;')
writeFileSync(OUT, lines.join('\n'), 'utf8')
console.log(`OK → ${OUT}`)
console.log(`Всего карточек: ${total}`)
console.log(report.join('  |  '))
