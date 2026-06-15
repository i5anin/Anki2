import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common'

import type { Note } from '../domain/note.entity'

import { CreateNoteDto } from './dto/create-note.dto'
import { UpdateNoteDto } from './dto/update-note.dto'
import { NotesService } from './notes.service'

@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(@Query('deckId') deckId?: string): Promise<Note[]> {
    return this.notes.list(deckId)
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<Note> {
    return this.notes.getOne(id)
  }

  @Post()
  create(@Body() dto: CreateNoteDto): Promise<Note> {
    return this.notes.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto): Promise<Note> {
    return this.notes.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<Record<string, never>> {
    await this.notes.remove(id)
    return {}
  }
}
