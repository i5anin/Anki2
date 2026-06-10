/** Когнитивный навык, который качает тренажёр. */
export type TrainerSkill = 'attention' | 'memory' | 'speed' | 'logic'

/** Итог сессии, который игра отдаёт наружу (emit complete). */
export interface TrainerOutcome {
  score: number
  /** Точность, % (0–100). */
  accuracy: number
  durationMs: number
}

/** Результат сессии тренажёра, как его отдаёт бэкенд. */
export interface TrainerResult {
  id: string
  trainerId: string
  skill: TrainerSkill
  level: number
  score: number
  accuracy: number
  durationMs: number
  playedAt: string
}

/** Данные для сохранения результата. */
export interface TrainerResultDraft {
  trainerId: string
  skill: TrainerSkill
  level: number
  score: number
  accuracy: number
  durationMs: number
}

/** Описание тренажёра в каталоге. */
export interface TrainerDef {
  id: string
  name: string
  skill: TrainerSkill
  icon: string
  description: string
}

/** Каталог тренажёров (id фиксированы — по ним хранятся результаты и уровни). */
export const TRAINERS: TrainerDef[] = [
  {
    id: 'schulte',
    name: 'Таблица Шульте',
    skill: 'attention',
    icon: 'pi pi-table',
    description: 'Найди значения по порядку: числа, hex, бинарные. Периферийное зрение и фокус.',
  },
  {
    id: 'code-nback',
    name: 'Код N-назад',
    skill: 'memory',
    icon: 'pi pi-history',
    description: 'Совпадает ли токен кода с показанным N шагов назад. Рабочая память.',
  },
  {
    id: 'spot-bug',
    name: 'Найди баг',
    skill: 'speed',
    icon: 'pi pi-exclamation-triangle',
    description: 'За секунды найди строку с ошибкой: lenght, = вместо ===, кавычки.',
  },
  {
    id: 'mental-eval',
    name: 'Ментальный интерпретатор',
    skill: 'logic',
    icon: 'pi pi-calculator',
    description: 'Вычисли результат JS-выражения в уме на время.',
  },
]

/** Подписи навыков по-русски. */
export const SKILL_LABELS: Record<TrainerSkill, string> = {
  attention: 'Внимание',
  memory: 'Память',
  speed: 'Скорость',
  logic: 'Логика',
}

/** Severity PrimeVue Tag для навыка. */
export const SKILL_SEVERITIES: Record<TrainerSkill, string> = {
  attention: 'info',
  memory: 'warn',
  speed: 'danger',
  logic: 'success',
}
