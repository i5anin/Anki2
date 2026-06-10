import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'

import { DecksService } from './decks.service'
import { CreateDeckDto } from './dto/create-deck.dto'
import { UpdateDeckDto } from './dto/update-deck.dto'
import type { Deck, DeckWithCounts } from '../domain/deck.entity'

@Controller('decks')
export class DecksController {
  constructor(private readonly decks: DecksService) {}

  @Get()
  listWithCounts(): Promise<DeckWithCounts[]> {
    return this.decks.listWithCounts()
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<Deck> {
    return this.decks.getOne(id)
  }

  @Post()
  create(@Body() dto: CreateDeckDto): Promise<Deck> {
    return this.decks.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeckDto): Promise<Deck> {
    return this.decks.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<Record<string, never>> {
    await this.decks.remove(id)
    return {}
  }
}
