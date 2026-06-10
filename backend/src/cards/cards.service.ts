import { Injectable, NotFoundException } from '@nestjs/common'

import { toRenderedCard } from '../rendering'
import { DataStore } from '../store/data-store'
import type { Card, RenderedCard } from '../domain/card.entity'
import type { NoteType } from '../domain/note-type.entity'
import type { Note } from '../domain/note.entity'
import type { CardFilter } from '../store/data-store'
import type { UpdateCardDto } from './dto/update-card.dto'

@Injectable()
export class CardsService {
  constructor(private readonly store: DataStore) {}

  async list(filter: CardFilter): Promise<RenderedCard[]> {
    const cards = await this.store.listCards(filter)

    const [notes, noteTypes] = await Promise.all([
      this.store.listNotes(),
      this.store.listNoteTypes(),
    ])
    const notesById = new Map<string, Note>(notes.map((note) => [note.id, note]))
    const noteTypesById = new Map<string, NoteType>(
      noteTypes.map((noteType) => [noteType.id, noteType]),
    )

    const rendered: RenderedCard[] = []
    for (const card of cards) {
      const note = notesById.get(card.noteId)
      if (!note) continue
      const noteType = noteTypesById.get(note.noteTypeId)
      if (!noteType) continue
      rendered.push(toRenderedCard(card, note, noteType))
    }

    return rendered
  }

  async getOne(id: string): Promise<RenderedCard> {
    const card = await this.store.getCard(id)
    if (!card) throw new NotFoundException('Карточка не найдена')
    return this.render(card)
  }

  async update(id: string, dto: UpdateCardDto): Promise<RenderedCard> {
    await this.getOne(id)

    const updated = await this.store.updateCard(id, dto)
    if (!updated) throw new NotFoundException('Карточка не найдена')

    return this.render(updated)
  }

  async remove(id: string): Promise<void> {
    await this.getOne(id)
    await this.store.deleteCard(id)
  }

  private async render(card: Card): Promise<RenderedCard> {
    const note = await this.store.getNote(card.noteId)
    if (!note) throw new NotFoundException('Заметка карточки не найдена')

    const noteType = await this.store.getNoteType(note.noteTypeId)
    if (!noteType) throw new NotFoundException('Модель заметки не найдена')

    return toRenderedCard(card, note, noteType)
  }
}
