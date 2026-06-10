/** Значения полей заметки: имя поля → содержимое (Markdown). */
export type NoteFields = Record<string, string>

/** Заметка. */
export interface Note {
  id: string
  noteTypeId: string
  deckId: string
  fields: NoteFields
  tags: string[]
  createdAt: string
  updatedAt: string
}

/** Данные формы создания/редактирования заметки. */
export interface NoteDraft {
  noteTypeId: string
  deckId: string
  fields: NoteFields
  tags: string[]
}
