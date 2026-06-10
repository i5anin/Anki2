import { http } from '@/shared/api'

import type { CardState, RenderedCard } from '../model/types'

const RESOURCE = '/api/cards'

export interface CardListFilter {
  deckId?: string
  state?: CardState
  noteId?: string
}

export interface CardUpdate {
  deckId?: string
  isSuspended?: boolean
}

/** REST-клиент сущности «Карточка» (обзор и правка планирования). */
export const cardApi = {
  async getList(filter: CardListFilter = {}): Promise<RenderedCard[]> {
    const { data } = await http.get<RenderedCard[]>(RESOURCE, { params: filter })
    return data
  },

  async getById(id: string): Promise<RenderedCard> {
    const { data } = await http.get<RenderedCard>(`${RESOURCE}/${id}`)
    return data
  },

  async update(id: string, patch: CardUpdate): Promise<RenderedCard> {
    const { data } = await http.patch<RenderedCard>(`${RESOURCE}/${id}`, patch)
    return data
  },

  async remove(id: string): Promise<void> {
    await http.delete(`${RESOURCE}/${id}`)
  },
}
