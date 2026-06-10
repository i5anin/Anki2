import { http } from '@/shared/api'

import type { Deck, DeckDraft, DeckWithCounts } from '../model/types'

const RESOURCE = '/api/decks'

/** REST-клиент сущности «Колода». */
export const deckApi = {
  async getList(): Promise<DeckWithCounts[]> {
    const { data } = await http.get<DeckWithCounts[]>(RESOURCE)
    return data
  },

  async getById(id: string): Promise<Deck> {
    const { data } = await http.get<Deck>(`${RESOURCE}/${id}`)
    return data
  },

  async create(draft: DeckDraft): Promise<Deck> {
    const { data } = await http.post<Deck>(RESOURCE, draft)
    return data
  },

  async update(id: string, draft: Partial<DeckDraft>): Promise<Deck> {
    const { data } = await http.patch<Deck>(`${RESOURCE}/${id}`, draft)
    return data
  },

  async remove(id: string): Promise<void> {
    await http.delete(`${RESOURCE}/${id}`)
  },
}
