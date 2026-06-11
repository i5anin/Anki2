import type { RenderedCard } from '@/entities/card'

export interface QuizOption {
  text: string
  correct: boolean
}

export interface QuizQuestion {
  cardId: string
  question: string
  options: QuizOption[]
}

/** Максимальная длина ответа, чтобы он годился как короткий вариант. */
const MAX_ANSWER_LEN = 120
const OPTIONS_PER_QUESTION = 4

/** Убирает разметку Markdown для компактного отображения варианта/вопроса. */
function stripMarkdown(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_`#>]/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Короткий ли ответ — годится для варианта в блице. */
function isShortAnswer(answer: string): boolean {
  return answer.length > 0 && answer.length <= MAX_ANSWER_LEN
}

/** Перемешивание Фишера—Йетса (копия массива). */
function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}

interface Candidate {
  cardId: string
  question: string
  answer: string
}

function toCandidate(card: RenderedCard): Candidate | null {
  const rawQuestion = card.noteFields.Front ?? card.frontMarkdown
  const rawAnswer = card.noteFields.Back ?? ''
  const question = stripMarkdown(rawQuestion)
  const answer = stripMarkdown(rawAnswer)
  if (question.length === 0 || !isShortAnswer(answer)) {
    return null
  }
  return { cardId: card.id, question, answer }
}

/**
 * Строит блиц-викторину из карточек колоды: вопрос + 4 варианта (правильный
 * ответ + 3 отвлекающих из других коротких карточек). Возвращает [] если
 * коротких карточек слишком мало для вариантов.
 */
export function buildQuiz(cards: RenderedCard[], limit = 10): QuizQuestion[] {
  const candidates: Candidate[] = []
  for (const card of cards) {
    const candidate = toCandidate(card)
    if (candidate !== null) {
      candidates.push(candidate)
    }
  }

  if (candidates.length < OPTIONS_PER_QUESTION) {
    return []
  }

  const answers = [...new Set(candidates.map((candidate) => candidate.answer))]

  return shuffle(candidates)
    .slice(0, limit)
    .map((candidate) => {
      const distractors = pickDistractors(answers, candidate.answer)
      const options: QuizOption[] = shuffle([
        { text: candidate.answer, correct: true },
        ...distractors.map((text) => ({ text, correct: false })),
      ])
      return { cardId: candidate.cardId, question: candidate.question, options }
    })
}

/** Грубая «форма» ответа — чтобы отвлекающие были похожи (число/слово/фраза). */
function shapeOf(answer: string): 'num' | 'token' | 'phrase' {
  if (/^-?(infinity|\d[\d.,]*)$/i.test(answer)) {
    return 'num'
  }
  return answer.includes(' ') ? 'phrase' : 'token'
}

/** 3 отвлекающих варианта: сперва той же «формы», затем добор из остальных. */
function pickDistractors(answers: string[], correct: string): string[] {
  const others = answers.filter((answer) => answer !== correct)
  const shape = shapeOf(correct)
  const sameShape = shuffle(others.filter((answer) => shapeOf(answer) === shape))
  const restShape = shuffle(others.filter((answer) => shapeOf(answer) !== shape))
  return [...sameShape, ...restShape].slice(0, OPTIONS_PER_QUESTION - 1)
}

/** Вопрос банка блица (курируемые варианты), как его отдаёт API. */
export interface QuizItem {
  id: string
  category: string
  question: string
  answer: string
  distractors: string[]
  difficulty: number
}

/** Тема банка для хаба блица. */
export interface QuizCategory {
  slug: string
  label: string
  icon: string
}

export const QUIZ_CATEGORIES: QuizCategory[] = [
  { slug: 'js', label: 'JavaScript', icon: 'pi pi-code' },
  { slug: 'ts', label: 'TypeScript', icon: 'pi pi-code' },
  { slug: 'css', label: 'HTML / CSS', icon: 'pi pi-palette' },
  { slug: 'vue', label: 'Vue 3', icon: 'pi pi-bolt' },
  { slug: 'system-design', label: 'Системный дизайн', icon: 'pi pi-sitemap' },
  { slug: 'infra', label: 'Инфраструктура', icon: 'pi pi-server' },
  { slug: 'analysis', label: 'Анализ', icon: 'pi pi-search' },
  { slug: 'management', label: 'Управление', icon: 'pi pi-users' },
]

/** Подпись темы по слагу (или «Вперемешку» для all). */
export function categoryLabel(slug: string): string {
  if (slug === 'all') {
    return 'Вперемешку'
  }
  return QUIZ_CATEGORIES.find((category) => category.slug === slug)?.label ?? slug
}

/** Строит MCQ-вопросы из банка: правильный ответ + курируемые отвлекающие. */
export function itemsToQuestions(items: QuizItem[], limit = 12): QuizQuestion[] {
  return shuffle(items)
    .slice(0, limit)
    .map((item) => {
      const options: QuizOption[] = shuffle([
        { text: item.answer, correct: true },
        ...item.distractors.map((text) => ({ text, correct: false })),
      ])
      return { cardId: item.id, question: item.question, options }
    })
}
