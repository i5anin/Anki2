import type { NoteType } from '../domain/note-type.entity'
import type { NoteFields } from '../domain/note.entity'

/** Описание карточки, которую нужно создать для заметки. */
export interface GeneratedCard {
  templateIndex: number
}

/**
 * Определяет набор карточек заметки:
 *  - обычная модель → по одной карточке на каждый шаблон;
 *  - cloze-модель   → по карточке на каждый номер пропуска `{{cN::…}}`.
 */
export function generateCards(fields: NoteFields, noteType: NoteType): GeneratedCard[] {
  if (noteType.isCloze) {
    const nums = new Set<number>()
    const text = Object.values(fields).join('\n')
    for (const match of text.matchAll(/\{\{c(\d+)::/g)) {
      nums.add(Number(match[1]))
    }
    if (nums.size === 0) return [{ templateIndex: 0 }]
    return [...nums].toSorted((a, b) => a - b).map((num) => ({ templateIndex: num - 1 }))
  }

  if (noteType.templates.length === 0) return [{ templateIndex: 0 }]
  return noteType.templates.map((_template, index) => ({ templateIndex: index }))
}
