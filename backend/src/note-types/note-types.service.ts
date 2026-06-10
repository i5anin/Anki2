import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { DataStore } from '../store/data-store'
import type { NoteType } from '../domain/note-type.entity'
import type { CreateNoteTypeDto } from './dto/create-note-type.dto'
import type { UpdateNoteTypeDto } from './dto/update-note-type.dto'

@Injectable()
export class NoteTypesService {
  constructor(private readonly store: DataStore) {}

  list(): Promise<NoteType[]> {
    return this.store.listNoteTypes()
  }

  async getOne(id: string): Promise<NoteType> {
    const noteType = await this.store.getNoteType(id)
    if (!noteType) throw new NotFoundException('Модель не найдена')
    return noteType
  }

  create(dto: CreateNoteTypeDto): Promise<NoteType> {
    return this.store.createNoteType({
      name: dto.name,
      fields: dto.fields,
      templates: dto.templates,
      isCloze: dto.isCloze,
    })
  }

  async update(id: string, dto: UpdateNoteTypeDto): Promise<NoteType> {
    await this.getOne(id)
    const updated = await this.store.updateNoteType(id, {
      name: dto.name,
      fields: dto.fields,
      templates: dto.templates,
      isCloze: dto.isCloze,
    })
    if (!updated) throw new NotFoundException('Модель не найдена')
    return updated
  }

  async remove(id: string): Promise<void> {
    const noteType = await this.getOne(id)
    if (noteType.isBuiltin) throw new BadRequestException('Встроенную модель удалять нельзя')
    await this.store.deleteNoteType(id)
  }
}
