import { Controller, Delete, Get, HttpCode, Param, Patch, Body, Query } from '@nestjs/common'

import { CardsService } from './cards.service'
import { UpdateCardDto } from './dto/update-card.dto'
import type { RenderedCard } from '../domain/card.entity'
import type { CardState } from '../srs'

@Controller('cards')
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  list(
    @Query('deckId') deckId?: string,
    @Query('state') state?: CardState,
    @Query('noteId') noteId?: string,
  ): Promise<RenderedCard[]> {
    return this.cards.list({ deckId, state, noteId })
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<RenderedCard> {
    return this.cards.getOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto): Promise<RenderedCard> {
    return this.cards.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<Record<string, never>> {
    await this.cards.remove(id)
    return {}
  }
}
