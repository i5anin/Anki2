import { computed, ref } from 'vue'

import type { RenderedCard } from '@/entities/card'
import type { DeckCounts } from '@/entities/deck'
import { studyApi, type IntervalPreview, type Rating } from '@/entities/study'
import { getErrorMessage } from '@/shared/api'

interface SessionStats {
  reviewed: number
  again: number
  hard: number
  good: number
  easy: number
}

const emptyCounts: DeckCounts = { new: 0, learning: 0, review: 0, due: 0, total: 0 }

/**
 * Стейт-машина учебной сессии: загрузка очереди, показ ответа, оценка
 * карточки (с замером времени) и переход к следующей. Один экземпляр на страницу.
 */
export function useStudySession() {
  const deckId = ref('')
  const deckName = ref('')
  const counts = ref<DeckCounts>({ ...emptyCounts })

  const queue = ref<RenderedCard[]>([])
  const index = ref(0)
  const revealed = ref(false)
  const previews = ref<IntervalPreview[]>([])

  const isLoading = ref(false)
  const isGrading = ref(false)
  const error = ref<string | null>(null)

  const stats = ref<SessionStats>({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 })

  let shownAt = 0

  const current = computed<RenderedCard | null>(() => queue.value[index.value] ?? null)
  const remaining = computed(() => Math.max(0, queue.value.length - index.value))
  const finished = computed(() => !isLoading.value && current.value === null)
  const progress = computed(() =>
    queue.value.length === 0 ? 0 : Math.round((index.value / queue.value.length) * 100),
  )

  async function loadPreviews(): Promise<void> {
    const card = current.value
    if (!card) {
      previews.value = []
      return
    }
    try {
      previews.value = await studyApi.getPreview(deckId.value, card.id)
    } catch {
      previews.value = []
    }
  }

  function markShown(): void {
    shownAt = Date.now()
  }

  async function start(id: string): Promise<void> {
    deckId.value = id
    isLoading.value = true
    error.value = null
    revealed.value = false
    index.value = 0
    stats.value = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 }
    try {
      const data = await studyApi.getQueue(id)
      deckName.value = data.deck.name
      counts.value = data.counts
      queue.value = data.cards
      markShown()
      await loadPreviews()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  function reveal(): void {
    if (current.value) revealed.value = true
  }

  function tally(rating: Rating): void {
    stats.value.reviewed += 1
    if (rating === 1) stats.value.again += 1
    else if (rating === 2) stats.value.hard += 1
    else if (rating === 3) stats.value.good += 1
    else stats.value.easy += 1
  }

  async function grade(rating: Rating): Promise<void> {
    const card = current.value
    if (!card || isGrading.value) return
    isGrading.value = true
    error.value = null
    try {
      const timeTakenMs = Math.max(0, Date.now() - shownAt)
      await studyApi.review({ cardId: card.id, rating, timeTakenMs })
      tally(rating)
      index.value += 1
      revealed.value = false
      markShown()
      await loadPreviews()
    } catch (e) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isGrading.value = false
    }
  }

  function restart(): Promise<void> {
    return start(deckId.value)
  }

  return {
    deckName,
    counts,
    queue,
    index,
    current,
    revealed,
    previews,
    isLoading,
    isGrading,
    error,
    stats,
    remaining,
    finished,
    progress,
    start,
    reveal,
    grade,
    restart,
  }
}
