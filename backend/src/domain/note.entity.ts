/** Значения полей заметки: имя поля → содержимое (Markdown). */
export type NoteFields = Record<string, string>

/** Заметка в формате API. */
export interface Note {
  id: string
  noteTypeId: string
  deckId: string
  fields: NoteFields
  tags: string[]
  createdAt: string
  updatedAt: string
}

/** Строка таблицы anki.notes (snake_case). */
export interface NoteRow {
  id: string
  note_type_id: string
  deck_id: string
  fields: NoteFields
  tags: string[] | null
  created_at: string
  updated_at: string
}
