/** Вопрос банка блица (MCQ) в формате API. */
export interface QuizItem {
  id: string
  /** Тема: js, ts, css, vue, system-design, infra, analysis, management, http. */
  category: string
  question: string
  /** Правильный ответ. */
  answer: string
  /** Курируемые отвлекающие варианты (обычно 3). */
  distractors: string[]
  /** Сложность 1–3. */
  difficulty: number
}

/** Строка таблицы anki.quiz_questions (snake_case). */
export interface QuizItemRow {
  id: string
  category: string
  question: string
  answer: string
  distractors: string[]
  difficulty: number
}
