/** Когнитивный навык, который качает тренажёр. */
export type TrainerSkill = 'attention' | 'memory' | 'speed' | 'logic'

/** Результат одной сессии тренажёра в формате API (camelCase). */
export interface TrainerResult {
  id: string
  /** Идентификатор тренажёра: schulte, code-nback, spot-bug, mental-eval. */
  trainerId: string
  skill: TrainerSkill
  /** Уровень сложности, на котором сыграна сессия (1..10). */
  level: number
  score: number
  /** Точность, % (0–100). */
  accuracy: number
  durationMs: number
  playedAt: string
}

/** Строка таблицы anki.trainer_results (snake_case). */
export interface TrainerResultRow {
  id: string
  trainer_id: string
  skill: TrainerSkill
  level: number
  score: number
  accuracy: number
  duration_ms: number
  played_at: string
}
