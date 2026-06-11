// Генератор банка вопросов блица из JSON по темам в SQL-сид для Supabase.
// Запуск: node backend/scripts/build-quiz-bank.mjs
// Читает backend/src/store/quiz/<category>.json, пишет supabase/seed-quiz.sql.
// UUID детерминированы (re-run идемпотентен) и совпадают с quiz-bank.seed.ts.

import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..', '..')
const QUIZ_DIR = resolve(ROOT, 'backend', 'src', 'store', 'quiz')
const OUT = resolve(ROOT, 'supabase', 'seed-quiz.sql')

const CATEGORIES = ['js', 'ts', 'css', 'vue', 'system-design', 'infra', 'analysis', 'management']

function uuid5(name) {
  const h = createHash('sha1').update(`anki-quiz:${name}`).digest('hex').slice(0, 32)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

function lit(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

const lines = []
lines.push('-- ============================================================================')
lines.push('-- Anki2 — банк вопросов блица (MCQ). Сгенерировано build-quiz-bank.mjs.')
lines.push('-- Применять ПОСЛЕ schema.sql. Идемпотентно (on conflict do nothing).')
lines.push('-- ============================================================================')
lines.push('begin;')
lines.push('')

let total = 0
const report = []

for (const category of CATEGORIES) {
  const file = resolve(QUIZ_DIR, `${category}.json`)
  let items
  try {
    items = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    console.error(`!! ${category}: ${e.message}`)
    process.exitCode = 1
    continue
  }

  lines.push(`-- ${category} (${items.length})`)
  items.forEach((item, i) => {
    const id = uuid5(`${category}:${i}`)
    const distractors = JSON.stringify(item.distractors ?? [])
    const difficulty = Number(item.difficulty) || 1
    lines.push(
      `insert into anki.quiz_questions (id, category, question, answer, distractors, difficulty) values (${lit(id)}, ${lit(category)}, ${lit(item.question)}, ${lit(item.answer)}, ${lit(distractors)}::jsonb, ${difficulty}) on conflict (id) do nothing;`,
    )
  })
  lines.push('')
  total += items.length
  report.push(`${category}: ${items.length}`)
}

lines.push('commit;')
writeFileSync(OUT, lines.join('\n'), 'utf8')
console.log(`OK → ${OUT}`)
console.log(`Всего вопросов: ${total}`)
console.log(report.join('  |  '))
