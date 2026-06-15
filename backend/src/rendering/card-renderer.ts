import type { NoteType } from '../domain/note-type.entity'
import type { NoteFields } from '../domain/note.entity'

/** Результат рендеринга карточки: готовый Markdown лицевой и оборотной сторон. */
export interface RenderedTemplate {
  frontMarkdown: string
  backMarkdown: string
}

interface ClozeOptions {
  activeNum: number
  reveal: boolean
}

/**
 * Рендерит cloze-поле: `{{c1::ответ::подсказка}}`.
 * Активный пропуск скрывается на лицевой стороне и подсвечивается на обороте;
 * остальные пропуски всегда показывают свой текст (для контекста).
 */
function renderCloze(text: string, opts: ClozeOptions): string {
  return text.replaceAll(
    /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g,
    (_match, numStr: string, answer: string, hint?: string) => {
      const num = Number(numStr)
      if (num !== opts.activeNum) return answer
      if (opts.reveal) return `**${answer}**`
      return hint ? `[${hint}]` : '[…]'
    },
  )
}

/**
 * Подставляет плейсхолдеры шаблона:
 *  - `{{cloze:Field}}` — рендер cloze-поля;
 *  - `{{FrontSide}}`   — отрисованная лицевая сторона;
 *  - `{{Field}}`       — значение поля.
 */
function applyTemplate(
  template: string,
  fields: NoteFields,
  frontSide: string,
  cloze: ClozeOptions | null,
): string {
  let out = template

  if (cloze) {
    out = out.replaceAll(/\{\{cloze:([^}]+)\}\}/g, (_m, raw: string) =>
      renderCloze(fields[raw.trim()] ?? '', cloze),
    )
  }

  out = out.replaceAll(/\{\{([^}]+)\}\}/g, (_m, raw: string) => {
    const name = raw.trim()
    if (name === 'FrontSide') return frontSide
    if (name.startsWith('cloze:')) return '' // уже обработано выше
    return fields[name] ?? ''
  })

  return out
}

/**
 * Отрисовывает карточку заметки по индексу шаблона.
 * Для cloze-моделей активный пропуск = `templateIndex + 1`.
 */
export function renderCard(
  fields: NoteFields,
  noteType: NoteType,
  templateIndex: number,
): RenderedTemplate {
  const template = noteType.templates[templateIndex] ?? noteType.templates[0]
  if (!template) return { frontMarkdown: '', backMarkdown: '' }

  if (noteType.isCloze) {
    const activeNum = templateIndex + 1
    const front = applyTemplate(template.front, fields, '', { activeNum, reveal: false })
    const back = applyTemplate(template.back, fields, front, { activeNum, reveal: true })
    return { frontMarkdown: front, backMarkdown: back }
  }

  const front = applyTemplate(template.front, fields, '', null)
  const back = applyTemplate(template.back, fields, front, null)
  return { frontMarkdown: front, backMarkdown: back }
}
