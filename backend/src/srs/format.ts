const MIN = 60
const HOUR = 3600
const DAY = 86_400
const MONTH = DAY * 30
const YEAR = DAY * 365

/** Дробное число с запятой и одним знаком («2,3»). */
function decimal(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

/**
 * Человекочитаемая длительность по числу секунд: «<1 мин», «10 мин»,
 * «3 ч», «4 д», «2,3 мес», «1,4 г». Используется на кнопках оценки.
 */
export function formatInterval(seconds: number): string {
  if (seconds < MIN) return '<1 мин'
  if (seconds < HOUR) return `${Math.round(seconds / MIN)} мин`
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} ч`
  if (seconds < MONTH) return `${Math.round(seconds / DAY)} д`
  if (seconds < YEAR) return `${decimal(seconds / MONTH)} мес`
  return `${decimal(seconds / YEAR)} г`
}
