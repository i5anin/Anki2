import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import { QUIZ_CATEGORIES, quizApi, type QuizItem } from '@/entities/quiz'
import { getErrorMessage } from '@/shared/api'

export interface HubCard {
  slug: string
  label: string
  icon: string
  count: number
}

interface BlitzHub {
  isLoading: Ref<boolean>
  error: Ref<string | null>
  cards: ComputedRef<HubCard[]>
  total: ComputedRef<number>
  selected: Ref<string[]>
  selectedCount: ComputedRef<number>
  play: (category: string) => void
  playMix: () => void
  clearSelection: () => void
}

/** Состояние и действия хаба «Блиц»: каталог тем + сборка микс-теста. */
export function useBlitzHub(): BlitzHub {
  const router = useRouter()
  const items = ref<QuizItem[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const selected = ref<string[]>([])

  const cards = computed<HubCard[]>(() => {
    const byCategory = new Map<string, number>()
    for (const item of items.value) {
      byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1)
    }
    return QUIZ_CATEGORIES.map((category) => ({
      slug: category.slug,
      label: category.label,
      icon: category.icon,
      count: byCategory.get(category.slug) ?? 0,
    }))
  })

  const total = computed(() => items.value.length)

  const selectedCount = computed<number>(() =>
    cards.value
      .filter((card) => selected.value.includes(card.slug))
      .reduce((sum, card) => sum + card.count, 0),
  )

  onMounted(async () => {
    try {
      items.value = await quizApi.getQuestions()
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isLoading.value = false
    }
  })

  function play(category: string): void {
    void router.push({ name: 'quiz-topic', params: { category } })
  }

  function playMix(): void {
    if (selected.value.length === 0) {
      return
    }
    void router.push({
      name: 'quiz-topic',
      params: { category: 'mix' },
      query: { topics: selected.value.join(',') },
    })
  }

  function clearSelection(): void {
    selected.value = []
  }

  return { isLoading, error, cards, total, selected, selectedCount, play, playMix, clearSelection }
}
