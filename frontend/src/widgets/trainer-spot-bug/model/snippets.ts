/** Раунд игры «Найди баг»: две строки кода, одна из них сломана. */
export interface SpotBugRound {
  lines: [string, string]
  bugIndex: 0 | 1
}

/** Корректные однострочники (JS/TS/Vue/CSS) — материал для мутаций. */
const BASE_LINES: string[] = [
  'const count = items.length',
  'if (a === b) { sum += 1 }',
  'arr.forEach((item) => console.log(item))',
  "el.addEventListener('click', handleClick)",
  'const data = JSON.parse(payload)',
  'const res = await axios.get(url)',
  ':deep(.btn) { color: var(--p-primary-color); }',
  'watch(() => props.id, load)',
  'const upper = name.toUpperCase()',
  'const ids = users.map((u) => u.id)',
  'const found = list.find((x) => x.id === id)',
  "localStorage.setItem('token', token)",
  "const parts = line.split(',')",
  "const root = document.querySelector('.app')",
  'const total = nums.reduce((acc, n) => acc + n, 0)',
  'setTimeout(() => done(), 500)',
  'const keys = Object.keys(config)',
  "if (status === 'ready') { start() }",
  'const last = items[items.length - 1]',
  "emit('update', value)",
  "router.push('/login')",
  'const isEmpty = list.length === 0',
  "console.log('loaded', items.length)",
  'const copy = JSON.parse(JSON.stringify(obj))',
]

/** Пары «правильно → опечатка» для мутатора опечаток. */
const TYPO_PAIRS: [string, string][] = [
  ['length', 'lenght'],
  ['forEach', 'forEeach'],
  ['addEventListener', 'addEventListner'],
  ['JSON.parse', 'JSON.Parse'],
  ['querySelector', 'querySelecter'],
  ['toUpperCase', 'toUppercase'],
  ['setTimeout', 'setTimout'],
]

type Mutator = (line: string) => string | null

function randomIndex(max: number): number {
  return Math.floor(Math.random() * max)
}

function dropCharAt(line: string, at: number): string {
  return line.slice(0, at) + line.slice(at + 1)
}

const MUTATORS: Mutator[] = [
  (line) => {
    const fits = TYPO_PAIRS.filter((pair) => line.includes(pair[0]))
    if (fits.length === 0) {
      return null
    }
    const pair = fits[randomIndex(fits.length)]
    return line.replace(pair[0], pair[1])
  },
  (line) => (line.includes('===') ? line.replace('===', '=') : null),
  (line) => (line.includes('=>') ? line.replace('=>', '->') : null),
  (line) => {
    const present = [')', ']', '}'].filter((bracket) => line.includes(bracket))
    if (present.length === 0) {
      return null
    }
    const bracket = present[randomIndex(present.length)]
    return dropCharAt(line, line.lastIndexOf(bracket))
  },
  (line) => {
    const at = line.lastIndexOf("'")
    return at === -1 ? null : dropCharAt(line, at)
  },
  (line) => {
    const at = line.indexOf("'")
    return at === -1 ? null : `${line.slice(0, at)}"${line.slice(at + 1)}`
  },
]

function shuffled<T>(source: T[]): T[] {
  const copy = [...source]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1)
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

/** Ломает строку случайным мутатором; null — ни один не применился. */
function mutateLine(line: string): string | null {
  for (const mutate of shuffled(MUTATORS)) {
    const result = mutate(line)
    if (result !== null && result !== line) {
      return result
    }
  }
  return null
}

/** Собирает раунд: исходная строка + гарантированно сломанная копия в случайном порядке. */
export function createRound(): SpotBugRound {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const line = BASE_LINES[randomIndex(BASE_LINES.length)]
    const broken = mutateLine(line)
    if (broken === null) {
      continue
    }
    const bugIndex: 0 | 1 = Math.random() < 0.5 ? 0 : 1
    const lines: [string, string] = bugIndex === 0 ? [broken, line] : [line, broken]
    return { lines, bugIndex }
  }
  return {
    lines: ['const size = items.length', 'const size = items.lenght'],
    bugIndex: 1,
  }
}
