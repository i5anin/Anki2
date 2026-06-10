const MIN = 60
const HOUR = 3600
const DAY = 86_400
const MONTH = DAY * 30
const YEAR = DAY * 365

function decimal(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

/** Человекочитаемая длительность по числу секунд («10 мин», «4 д», «2,3 мес»). */
export function formatInterval(seconds: number): string {
  if (seconds < MIN) return '<1 мин'
  if (seconds < HOUR) return `${Math.round(seconds / MIN)} мин`
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} ч`
  if (seconds < MONTH) return `${Math.round(seconds / DAY)} д`
  if (seconds < YEAR) return `${decimal(seconds / MONTH)} мес`
  return `${decimal(seconds / YEAR)} г`
}

/** Дата в формате дд.мм.гггг. */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ru-RU')
}

/** Дата и время в формате дд.мм.гггг чч:мм. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Относительный срок до повторения: «сейчас», «через 3 д», «3 д назад». */
export function relativeDue(iso: string): string {
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return '—'
  const deltaSec = Math.round((target - Date.now()) / 1000)
  if (deltaSec <= 0) return 'сейчас'
  return `через ${formatInterval(deltaSec)}`
}
