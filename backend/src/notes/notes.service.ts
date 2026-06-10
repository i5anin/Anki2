import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { generateCards } from '../rendering'
import { DataStore } from '../store/data-store'
import type { Note } from '../domain/note.entity'
import type { CreateNoteDto } from './dto/create-note.dto'
import type { UpdateNoteDto } from './dto/update-note.dto'

@Injectable()
export class NotesService {
  constructor(private readonly store: DataStore) {}

  list(deckId?: string): Promise<Note[]> {
    return this.store.listNotes(deckId)
  }

  async getOne(id: string): Promise<Note> {
    const note = await this.store.getNote(id)
    if (!note) throw new NotFoundException('Заметка не найдена')
    return note
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    const noteType = await this.store.getNoteType(dto.noteTypeId)
    if (!noteType) throw new BadRequestException('Неизвестная модель заметки')

    const deck = await this.store.getDeck(dto.deckId)
    if (!deck) throw new BadRequestException('Колода не найдена')

    const note = await this.store.createNote(dto)
    const desired = generateCards(note.fields, noteType)
    await this.store.createCards(
      desired.map((g) => ({
        noteId: note.id,
        deckId: note.deckId,
        templateIndex: g.templateIndex,
      })),
    )

    return note
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    await this.getOne(id)

    const updated = await this.store.updateNote(id, dto)
    if (!updated) throw new NotFoundException('Заметка не найдена')

    const noteType = await this.store.getNoteType(updated.noteTypeId)
    if (!noteType) throw new BadRequestException('Неизвестная модель заметки')

    const existing = await this.store.listCards({ noteId: id })
    const desired = generateCards(updated.fields, noteType)

    const existingIndexes = new Set(existing.map((card) => card.templateIndex))
    const desiredIndexes = new Set(desired.map((g) => g.templateIndex))

    const toCreate = desired.filter((g) => !existingIndexes.has(g.templateIndex))
    if (toCreate.length > 0) {
      await this.store.createCards(
        toCreate.map((g) => ({
          noteId: updated.id,
          deckId: updated.deckId,
          templateIndex: g.templateIndex,
        })),
      )
    }

    for (const card of existing) {
      if (!desiredIndexes.has(card.templateIndex)) {
        await this.store.deleteCard(card.id)
        continue
      }
      if (dto.deckId !== undefined) {
        await this.store.updateCard(card.id, { deckId: dto.deckId })
      }
    }

    return updated
  }

  async remove(id: string): Promise<void> {
    await this.getOne(id)
    await this.store.deleteCardsByNote(id)
    await this.store.deleteNote(id)
  }
}
