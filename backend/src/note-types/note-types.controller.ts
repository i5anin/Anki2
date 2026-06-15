import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'

import type { NoteType } from '../domain/note-type.entity'

import { CreateNoteTypeDto } from './dto/create-note-type.dto'
import { UpdateNoteTypeDto } from './dto/update-note-type.dto'
import { NoteTypesService } from './note-types.service'

@Controller('note-types')
export class NoteTypesController {
  constructor(private readonly noteTypes: NoteTypesService) {}

  @Get()
  list(): Promise<NoteType[]> {
    return this.noteTypes.list()
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<NoteType> {
    return this.noteTypes.getOne(id)
  }

  @Post()
  create(@Body() dto: CreateNoteTypeDto): Promise<NoteType> {
    return this.noteTypes.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteTypeDto): Promise<NoteType> {
    return this.noteTypes.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<Record<string, never>> {
    await this.noteTypes.remove(id)
    return {}
  }
}
