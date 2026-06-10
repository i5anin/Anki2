import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useDecksStore, type DeckWithCounts } from '@/entities/deck'

/** Подтверждение и выполнение удаления колоды. */
export function useDeleteDeck(): { confirmDelete: (deck: DeckWithCounts) => void } {
  const confirm = useConfirm()
  const toast = useToast()
  const store = useDecksStore()

  async function runDelete(deck: DeckWithCounts): Promise<void> {
    try {
      await store.remove(deck.id)
      toast.add({ severity: 'success', summary: 'Удалено', detail: 'Колода удалена', life: 3000 })
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: store.error ?? 'Не удалось удалить колоду',
        life: 4000,
      })
    }
  }

  function confirmDelete(deck: DeckWithCounts): void {
    confirm.require({
      header: 'Удаление',
      message: `Удалить колоду «${deck.name}»? Все карточки будут удалены.`,
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: 'Отмена', severity: 'secondary', outlined: true },
      acceptProps: { label: 'Удалить', severity: 'danger' },
      accept: () => {
        void runDelete(deck)
      },
    })
  }

  return { confirmDelete }
}
