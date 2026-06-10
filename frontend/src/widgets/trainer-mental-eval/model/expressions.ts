// ============================================================================
// Генераторы JS-выражений для «Ментального интерпретатора».
// Верный ответ всегда вычисляется обычным JS-кодом над теми же значениями,
// дистракторы — правдоподобные ошибки (офф-бай-уан, перепутанный метод).
// ============================================================================

/** Раунд игры: код, верный ответ и перемешанные варианты (4 шт.). */
export interface EvalRound {
  code: string
  answer: string
  options: string[]
}

interface ExpressionTask {
  code: string
  answer: string
  distractors: string[]
}

type TaskGenerator = () => ExpressionTask

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)]
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i)
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}

/** Собирает 3 числовых дистрактора: без дублей и ответа, при нехватке добивает соседями. */
function numberOptions(answer: number, candidates: number[]): string[] {
  const unique: number[] = []
  for (const value of candidates) {
    if (value !== answer && !unique.includes(value)) {
      unique.push(value)
    }
  }
  let extra = answer + 3
  while (unique.length < 3) {
    if (extra !== answer && !unique.includes(extra)) {
      unique.push(extra)
    }
    extra += 1
  }
  return unique.slice(0, 3).map((value) => String(value))
}

// --- Арифметика с приоритетом (любой уровень) -------------------------------

function genPrecedence(): ExpressionTask {
  const a = randomInt(2, 9)
  const b = randomInt(2, 6)
  const c = randomInt(2, 6)
  const answer = a + b * c
  return {
    code: `${a} + ${b} * ${c}`,
    answer: String(answer),
    distractors: numberOptions(answer, [(a + b) * c, answer + 1, answer - 1]),
  }
}

function genDivision(): ExpressionTask {
  const c = randomInt(2, 4)
  const q = randomInt(2, 6)
  const b = randomInt(2, 9)
  const a = b + q * c
  const answer = (a - b) / c
  return {
    code: `(${a} - ${b}) / ${c}`,
    answer: String(answer),
    distractors: numberOptions(answer, [a - b, answer + 1, answer - 1]),
  }
}

function genModulo(): ExpressionTask {
  const a = randomInt(7, 29)
  const b = randomInt(3, 6)
  const answer = a % b
  return {
    code: `${a} % ${b}`,
    answer: String(answer),
    distractors: numberOptions(answer, [Math.floor(a / b), answer + 1, answer + 2]),
  }
}

function genPower(): ExpressionTask {
  const a = randomInt(2, 3)
  const b = randomInt(2, 4)
  const answer = a ** b
  return {
    code: `${a} ** ${b}`,
    answer: String(answer),
    distractors: numberOptions(answer, [a * b, b ** a, answer + a]),
  }
}

// --- Коварные мелочи JS (любой уровень) -------------------------------------

function genTypeofNull(): ExpressionTask {
  return {
    code: 'typeof null',
    answer: `'${typeof null}'`,
    distractors: ["'null'", "'undefined'", "'number'"],
  }
}

function genConcat(): ExpressionTask {
  const left = String(randomInt(2, 9))
  const right = randomInt(2, 9)
  const value = left + String(right)
  return {
    code: `'${left}' + ${right}`,
    answer: `'${value}'`,
    distractors: [String(Number(left) + right), `'${Number(left) + right}'`, 'NaN'],
  }
}

function genStringMinus(): ExpressionTask {
  const left = String(randomInt(4, 9))
  const right = randomInt(1, 3)
  const value = Number(left) - right
  return {
    code: `'${left}' - ${right}`,
    answer: String(value),
    distractors: [`'${value}'`, 'NaN', `${left}${right}`],
  }
}

function genNanEquality(): ExpressionTask {
  const left = Number.NaN
  const right = Number.NaN
  const value = left === right
  return {
    code: 'NaN === NaN',
    answer: String(value),
    distractors: ['true', 'NaN', 'undefined'],
  }
}

// --- Массивы (уровень 3+) ----------------------------------------------------

function genMapIndex(): ExpressionTask {
  const items = [randomInt(1, 9), randomInt(1, 9), randomInt(1, 9)]
  const factor = randomInt(2, 4)
  const index = randomInt(0, 2)
  const mapped = items.map((x) => x * factor)
  const answer = mapped[index]
  const shifted = mapped[(index + 1) % 3]
  return {
    code: `[${items.join(', ')}].map((x) => x * ${factor})[${index}]`,
    answer: String(answer),
    distractors: numberOptions(answer, [items[index], shifted, answer + factor]),
  }
}

function genFilterLength(): ExpressionTask {
  const items = [randomInt(1, 9), randomInt(1, 9), randomInt(1, 9), randomInt(1, 9)]
  const answer = items.filter((x) => x % 2 === 0).length
  return {
    code: `[${items.join(', ')}].filter((x) => x % 2 === 0).length`,
    answer: String(answer),
    distractors: numberOptions(answer, [items.length - answer, answer + 1, items.length]),
  }
}

function genIndexOf(): ExpressionTask {
  const letters = ['a', 'b', 'c']
  const target = pickOne(['a', 'b', 'c', 'd'])
  const answer = letters.indexOf(target)
  const candidates = answer === -1 ? [0, 1, 2] : [answer + 1, answer - 1, -1]
  return {
    code: `['a', 'b', 'c'].indexOf('${target}')`,
    answer: String(answer),
    distractors: numberOptions(answer, candidates),
  }
}

function genSliceLength(): ExpressionTask {
  const items = [randomInt(1, 9), randomInt(1, 9), randomInt(1, 9), randomInt(1, 9)]
  const start = randomInt(1, 2)
  const answer = items.slice(start).length
  return {
    code: `[${items.join(', ')}].slice(${start}).length`,
    answer: String(answer),
    distractors: numberOptions(answer, [start, items.length, answer + 1]),
  }
}

// --- Строки (уровень 5+) -----------------------------------------------------

function genUpperCase(): ExpressionTask {
  const word = pickOne(['vue', 'node', 'pinia', 'vite', 'nest'])
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1)
  return {
    code: `'${word}'.toUpperCase()`,
    answer: `'${word.toUpperCase()}'`,
    distractors: [`'${word}'`, `'${capitalized}'`, 'undefined'],
  }
}

function genStringSlice(): ExpressionTask {
  const base = pickOne(['abcdef', 'qwerty', 'zxcvbn'])
  const start = randomInt(1, 2)
  const end = start + randomInt(2, 3)
  return {
    code: `'${base}'.slice(${start}, ${end})`,
    answer: `'${base.slice(start, end)}'`,
    distractors: [
      `'${base.slice(start, end + 1)}'`,
      `'${base.slice(start - 1, end - 1)}'`,
      `'${base.slice(start + 1, end + 1)}'`,
    ],
  }
}

function genSplitLength(): ExpressionTask {
  const count = randomInt(3, 5)
  const source = ['a', 'b', 'c', 'd', 'e'].slice(0, count).join(',')
  const answer = source.split(',').length
  return {
    code: `'${source}'.split(',').length`,
    answer: String(answer),
    distractors: numberOptions(answer, [answer - 1, answer + 1, source.length]),
  }
}

// --- Цепочки (уровень 7+) ----------------------------------------------------

function genMapFilterChain(): ExpressionTask {
  const items = [randomInt(1, 5), randomInt(1, 5), randomInt(1, 5)]
  const inc = randomInt(1, 3)
  const limit = randomInt(2, 5)
  const answer = items.map((x) => x + inc).filter((x) => x > limit).length
  const withoutMap = items.filter((x) => x > limit).length
  return {
    code: `[${items.join(', ')}].map((x) => x + ${inc}).filter((x) => x > ${limit}).length`,
    answer: String(answer),
    distractors: numberOptions(answer, [withoutMap, answer + 1, items.length]),
  }
}

function genSpreadString(): ExpressionTask {
  const word = pickOne(['abc', 'vue', 'node', 'front', 'jsx'])
  const answer = Array.from(word).length
  return {
    code: `[...'${word}'].length`,
    answer: String(answer),
    distractors: numberOptions(answer, [1, answer + 1, answer - 1]),
  }
}

function genMaxSpread(): ExpressionTask {
  const items = shuffle([randomInt(1, 3), randomInt(4, 6), randomInt(7, 9)])
  const answer = Math.max(...items)
  return {
    code: `Math.max(...[${items.join(', ')}])`,
    answer: String(answer),
    distractors: [String(Math.min(...items)), 'NaN', String(answer + 1)],
  }
}

// --- Пул по уровню и сборка раунда --------------------------------------------

const POOLS: { minLevel: number; gens: TaskGenerator[] }[] = [
  { minLevel: 1, gens: [genPrecedence, genDivision, genModulo, genPower] },
  { minLevel: 1, gens: [genTypeofNull, genConcat, genStringMinus, genNanEquality] },
  { minLevel: 3, gens: [genMapIndex, genFilterLength, genIndexOf, genSliceLength] },
  { minLevel: 5, gens: [genUpperCase, genStringSlice, genSplitLength] },
  { minLevel: 7, gens: [genMapFilterChain, genSpreadString, genMaxSpread] },
]

function buildPool(level: number): TaskGenerator[] {
  return POOLS.filter((pool) => level >= pool.minLevel).flatMap((pool) => pool.gens)
}

/** Создаёт раунд: случайное выражение из пула уровня + перемешанные 4 варианта. */
export function createEvalRound(level: number): EvalRound {
  const task = pickOne(buildPool(level))()
  return {
    code: task.code,
    answer: task.answer,
    options: shuffle([task.answer, ...task.distractors]),
  }
}
