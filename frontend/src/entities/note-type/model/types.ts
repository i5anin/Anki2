/** Шаблон карточки внутри модели заметки. */
export interface CardTemplate {
  name: string
  front: string
  back: string
}

/** Модель заметки (note type). */
export interface NoteType {
  id: string
  name: string
  fields: string[]
  templates: CardTemplate[]
  isCloze: boolean
  isBuiltin: boolean
  createdAt: string
  updatedAt: string
}

/** Данные формы создания/редактирования модели. */
export interface NoteTypeDraft {
  name: string
  fields: string[]
  templates: CardTemplate[]
  isCloze: boolean
}
