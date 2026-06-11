import { createHash } from 'node:crypto'

import type { QuizItem } from '../domain/quiz-item.entity'

import analysisQuiz from './quiz/analysis.json'
import cssQuiz from './quiz/css.json'
import infraQuiz from './quiz/infra.json'
import jsQuiz from './quiz/js.json'
import managementQuiz from './quiz/management.json'
import systemDesignQuiz from './quiz/system-design.json'
import tsQuiz from './quiz/ts.json'
import vueQuiz from './quiz/vue.json'

interface RawQuizItem {
  question: string
  answer: string
  distractors: string[]
  difficulty: number
}

interface QuizCategory {
  category: string
  items: RawQuizItem[]
}

/** Банк по темам. Категории совпадают с supabase/seed-quiz.sql. */
const BANK: QuizCategory[] = [
  { category: 'js', items: jsQuiz },
  { category: 'ts', items: tsQuiz },
  { category: 'css', items: cssQuiz },
  { category: 'vue', items: vueQuiz },
  { category: 'system-design', items: systemDesignQuiz },
  { category: 'infra', items: infraQuiz },
  { category: 'analysis', items: analysisQuiz },
  { category: 'management', items: managementQuiz },
]

/** Детерминированный UUID (тот же алгоритм, что в build-quiz-bank.mjs). */
function uuid5(name: string): string {
  const h = createHash('sha1').update(`anki-quiz:${name}`).digest('hex').slice(0, 32)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/** Банк вопросов блица для демо-режима (зеркало supabase/seed-quiz.sql). */
export function createQuizBankSeed(): QuizItem[] {
  const items: QuizItem[] = []
  for (const group of BANK) {
    group.items.forEach((raw, i) => {
      items.push({
        id: uuid5(`${group.category}:${i}`),
        category: group.category,
        question: raw.question,
        answer: raw.answer,
        distractors: raw.distractors,
        difficulty: raw.difficulty,
      })
    })
  }
  return items
}
