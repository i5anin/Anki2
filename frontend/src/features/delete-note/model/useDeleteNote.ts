import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { type Note, useNotesStore } from '@/entities/note'

/** Подтверждение и выполнение удаления заметки. */
export function useDeleteNote(): { confirmDelete: (note: Note) => void } {
  const confirm = useConfirm()
  const toast = useToast()
  const store = useNotesStore()

  async function runDelete(note: Note): Promise<void> {
    try {
      await store.remove(note.id)
      toast.add({ severity: 'success', summary: 'Удалено', detail: 'Заметка удалена', life: 3000 })
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: store.error ?? 'Не удалось удалить заметку',
        life: 4000,
      })
    }
  }

  function confirmDelete(note: Note): void {
    confirm.require({
      header: 'Удаление заметки',
      message: 'Удалить заметку? Её карточки будут удалены.',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: 'Отмена', severity: 'secondary', outlined: true },
      acceptProps: { label: 'Удалить', severity: 'danger' },
      accept: () => {
        void runDelete(note)
      },
    })
  }

  return { confirmDelete }
}
