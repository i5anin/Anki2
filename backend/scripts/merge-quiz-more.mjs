// Сливает quiz/<cat>.more.json в quiz/<cat>.json с дедупликацией по тексту вопроса.
// Невалидные элементы (нет 3 отвлекающих / не 4 уникальных варианта) отбрасываются.
// Запуск: node backend/scripts/merge-quiz-more.mjs

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const QUIZ_DIR = resolve(here, '..', 'src', 'store', 'quiz')
const CATEGORIES = ['js', 'ts', 'css', 'vue', 'system-design', 'infra', 'analysis', 'management']

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim()

function valid(q) {
  if (typeof q?.question !== 'string' || typeof q?.answer !== 'string') return false
  if (!Array.isArray(q.distractors) || q.distractors.length !== 3) return false
  const opts = new Set([q.answer, ...q.distractors].map((o) => String(o)))
  return opts.size === 4
}

let grandBefore = 0
let grandAfter = 0
const report = []

for (const cat of CATEGORIES) {
  const base = resolve(QUIZ_DIR, `${cat}.json`)
  const more = resolve(QUIZ_DIR, `${cat}.more.json`)
  const existing = JSON.parse(readFileSync(base, 'utf8'))
  grandBefore += existing.length

  const seen = new Set(existing.map((q) => norm(q.question)))
  const merged = [...existing]
  let added = 0
  let skipped = 0

  if (existsSync(more)) {
    let extra
    try {
      extra = JSON.parse(readFileSync(more, 'utf8'))
    } catch (e) {
      console.error(`!! ${cat}.more.json: ${e.message}`)
      process.exitCode = 1
      extra = []
    }
    for (const q of extra) {
      const key = norm(q?.question)
      if (!valid(q) || key.length === 0 || seen.has(key)) {
        skipped += 1
        continue
      }
      seen.add(key)
      merged.push({
        question: q.question,
        answer: q.answer,
        distractors: q.distractors,
        difficulty: Number(q.difficulty) || 1,
      })
      added += 1
    }
    rmSync(more)
  }

  writeFileSync(base, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
  grandAfter += merged.length
  report.push(`${cat}: ${existing.length} +${added} = ${merged.length}${skipped ? ` (откинуто ${skipped})` : ''}`)
}

console.log(report.join('\n'))
console.log(`ИТОГО: ${grandBefore} -> ${grandAfter} (+${grandAfter - grandBefore})`)
