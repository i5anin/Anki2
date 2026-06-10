/** Шаблон карточки внутри модели заметки. */
export interface CardTemplate {
  name: string
  /** Лицевая сторона, напр. `{{Front}}` или `{{cloze:Text}}`. */
  front: string
  /** Оборот, напр. `{{FrontSide}}\n\n---\n\n{{Back}}`. */
  back: string
}

/** Модель заметки (note type) в формате API. */
export interface NoteType {
  id: string
  name: string
  /** Имена полей по порядку, напр. `["Front","Back"]`. */
  fields: string[]
  templates: CardTemplate[]
  isCloze: boolean
  isBuiltin: boolean
  createdAt: string
  updatedAt: string
}

/** Строка таблицы anki.note_types (snake_case). */
export interface NoteTypeRow {
  id: string
  name: string
  fields: string[]
  templates: CardTemplate[]
  is_cloze: boolean
  is_builtin: boolean
  created_at: string
  updated_at: string
}
