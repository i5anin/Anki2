import { http } from '@/shared/api'

import type {
  ForecastPoint,
  RetentionStats,
  ReviewsByDayPoint,
  StatsInsights,
  StatsOverview,
} from '../model/types'

const RESOURCE = '/api/stats'

function params(deckId?: string, days?: number): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  if (deckId !== undefined && deckId.length > 0) {
    out.deckId = deckId
  }
  if (days !== undefined && days > 0) {
    out.days = days
  }
  return out
}

/** REST-клиент статистики. */
export const statsApi = {
  async overview(deckId?: string): Promise<StatsOverview> {
    const { data } = await http.get<StatsOverview>(`${RESOURCE}/overview`, {
      params: params(deckId),
    })
    return data
  },

  async forecast(deckId?: string, days = 30): Promise<ForecastPoint[]> {
    const { data } = await http.get<ForecastPoint[]>(`${RESOURCE}/forecast`, {
      params: params(deckId, days),
    })
    return data
  },

  async retention(deckId?: string): Promise<RetentionStats> {
    const { data } = await http.get<RetentionStats>(`${RESOURCE}/retention`, {
      params: params(deckId),
    })
    return data
  },

  async reviewsByDay(deckId?: string, days = 30): Promise<ReviewsByDayPoint[]> {
    const { data } = await http.get<ReviewsByDayPoint[]>(`${RESOURCE}/reviews-by-day`, {
      params: params(deckId, days),
    })
    return data
  },

  async insights(deckId?: string): Promise<StatsInsights> {
    const { data } = await http.get<StatsInsights>(`${RESOURCE}/insights`, {
      params: params(deckId),
    })
    return data
  },
}
