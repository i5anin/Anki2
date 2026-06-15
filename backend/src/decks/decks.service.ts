import { Injectable, NotFoundException } from '@nestjs/common'

import type { Deck, DeckWithCounts } from '../domain/deck.entity'
import type { CreateDeckDto } from './dto/create-deck.dto'
import type { UpdateDeckDto } from './dto/update-deck.dto'

import { DataStore } from '../store/data-store'
import { countDeck } from '../study/queue'

/** Начало сегодняшних суток (локальное время) в ISO. */
function startOfTodayIso(now: Date): string {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

@Injectable()
export class DecksService {
  constructor(private readonly store: DataStore) {}

  async listWithCounts(): Promise<DeckWithCounts[]> {
    const now = new Date()
    const since = startOfTodayIso(now)
    const decks = await this.store.listDecks()

    return Promise.all(
      decks.map(async (deck) => {
        const cards = await this.store.listCards({ deckId: deck.id })
        const logsToday = await this.store.listReviewLogs({ deckId: deck.id, since })
        const counts = countDeck(cards, logsToday, deck.config, now)
        return { ...deck, counts }
      }),
    )
  }

  async getOne(id: string): Promise<Deck> {
    const deck = await this.store.getDeck(id)
    if (!deck) throw new NotFoundException('Колода не найдена')
    return deck
  }

  create(dto: CreateDeckDto): Promise<Deck> {
    return this.store.createDeck(dto)
  }

  async update(id: string, dto: UpdateDeckDto): Promise<Deck> {
    await this.getOne(id)
    const updated = await this.store.updateDeck(id, dto)
    if (!updated) throw new NotFoundException('Колода не найдена')
    return updated
  }

  async remove(id: string): Promise<void> {
    await this.getOne(id)
    await this.store.deleteDeck(id)
  }
}
