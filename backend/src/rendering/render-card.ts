import type { Card, RenderedCard } from '../domain/card.entity'
import type { NoteType } from '../domain/note-type.entity'
import type { Note } from '../domain/note.entity'
import { renderCard } from './card-renderer'

/** Собирает карточку с отрисованным Markdown и контекстом заметки. */
export function toRenderedCard(card: Card, note: Note, noteType: NoteType): RenderedCard {
  const { frontMarkdown, backMarkdown } = renderCard(note.fields, noteType, card.templateIndex)
  return {
    ...card,
    frontMarkdown,
    backMarkdown,
    noteFields: note.fields,
    noteTypeName: noteType.name,
    tags: note.tags,
  }
}
