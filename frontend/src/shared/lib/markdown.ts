import hljs from 'highlight.js/lib/common'
import katex from 'katex'
import MarkdownIt from 'markdown-it'

// Минимальные структурные интерфейсы состояния markdown-it: типы StateInline/
// StateBlock не экспонируются из корня пакета, а локальные интерфейсы
// структурно совместимы с правилами (RuleInline/RuleBlock) и обходятся без any.
interface MathToken {
  markup: string
  content: string
  block: boolean
  map: [number, number] | null
}

interface InlineState {
  src: string
  pos: number
  posMax: number
  pending: string
  push(type: string, tag: string, nesting: number): MathToken
}

interface BlockState {
  src: string
  bMarks: number[]
  eMarks: number[]
  tShift: number[]
  blkIndent: number
  line: number
  push(type: string, tag: string, nesting: number): MathToken
  getLines(begin: number, end: number, indent: number, keepLastLF: boolean): string
}

/** Безопасный рендер формулы KaTeX (ошибки не валят страницу). */
function renderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, { displayMode, throwOnError: false, output: 'html' })
  } catch {
    const delim = displayMode ? '$$' : '$'
    return `${delim}${latex}${delim}`
  }
}

/** Проверяет, может ли `$` на позиции открывать/закрывать инлайн-формулу. */
function isValidDelim(state: InlineState, pos: number): { canOpen: boolean; canClose: boolean } {
  const prev = pos > 0 ? state.src.charCodeAt(pos - 1) : -1
  const next = pos + 1 <= state.posMax ? state.src.charCodeAt(pos + 1) : -1
  let canOpen = true
  let canClose = true
  // 0x20 пробел, 0x09 таб; 0x30..0x39 — цифры (чтобы не цеплять «$5»)
  if (prev === 0x20 || prev === 0x09 || (next >= 0x30 && next <= 0x39)) canClose = false
  if (next === 0x20 || next === 0x09) canOpen = false
  return { canOpen, canClose }
}

/** Инлайн-формула: `$ ... $`. */
// Токенайзер формул (портирован) — допускаем повышенную когнитивную сложность.
// eslint-disable-next-line sonarjs/cognitive-complexity
function mathInline(state: InlineState, silent: boolean): boolean {
  if (state.src[state.pos] !== '$') return false

  let res = isValidDelim(state, state.pos)
  if (!res.canOpen) {
    if (!silent) state.pending += '$'
    state.pos += 1
    return true
  }

  const start = state.pos + 1
  let match = start
  let pos: number
  while ((match = state.src.indexOf('$', match)) !== -1) {
    pos = match - 1
    while (state.src[pos] === '\\') pos -= 1
    if ((match - pos) % 2 === 1) break
    match += 1
  }

  if (match === -1) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }
  if (match - start === 0) {
    if (!silent) state.pending += '$$'
    state.pos = start + 1
    return true
  }

  res = isValidDelim(state, match)
  if (!res.canClose) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }

  if (!silent) {
    const token = state.push('math_inline', 'math', 0)
    token.markup = '$'
    token.content = state.src.slice(start, match)
  }
  state.pos = match + 1
  return true
}

/** Блочная формула: `$$ ... $$`. */
function mathBlock(state: BlockState, start: number, end: number, silent: boolean): boolean {
  let pos = state.bMarks[start] + state.tShift[start]
  let max = state.eMarks[start]
  if (pos + 2 > max) return false
  if (state.src.slice(pos, pos + 2) !== '$$') return false

  pos += 2
  let firstLine = state.src.slice(pos, max)
  if (silent) return true

  let found = false
  if (firstLine.trim().endsWith('$$')) {
    firstLine = firstLine.trim().slice(0, -2)
    found = true
  }

  let next = start
  let lastLine = ''
  while (!found) {
    next += 1
    if (next >= end) break
    pos = state.bMarks[next] + state.tShift[next]
    max = state.eMarks[next]
    if (pos < max && state.tShift[next] < state.blkIndent) break
    if (state.src.slice(pos, max).trim().endsWith('$$')) {
      const lastPos = state.src.slice(0, max).lastIndexOf('$$')
      lastLine = state.src.slice(pos, lastPos)
      found = true
    }
  }

  state.line = next + 1
  const token = state.push('math_block', 'math', 0)
  token.block = true
  token.content =
    (firstLine.trim() === '' ? '' : `${firstLine}\n`) +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (lastLine.trim() === '' ? '' : lastLine)
  token.markup = '$$'
  token.map = [start, state.line]
  return true
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  langPrefix: 'language-',
  highlight(code, lang) {
    if (lang.length > 0 && hljs.getLanguage(lang) !== undefined) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch {
        return ''
      }
    }
    return ''
  },
})

md.inline.ruler.after('escape', 'math_inline', mathInline)
md.block.ruler.after('blockquote', 'math_block', mathBlock, {
  alt: ['paragraph', 'reference', 'blockquote', 'list'],
})
md.renderer.rules.math_inline = (tokens, idx) => renderKatex(tokens[idx].content, false)
md.renderer.rules.math_block = (tokens, idx) => `${renderKatex(tokens[idx].content, true)}\n`

/** Рендерит Markdown карточки в HTML (с подсветкой кода и формулами KaTeX). */
export function renderMarkdown(source: string): string {
  return md.render(source ?? '')
}
