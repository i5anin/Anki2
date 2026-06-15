<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, reactive, ref, watch } from 'vue'

import { type DeckDraft, useDecksStore } from '@/entities/deck'

import { useManageDeck } from '../model/useManageDeck'

const store = useDecksStore()
const toast = useToast()
const { isOpen, editing, close } = useManageDeck()

const draft = reactive<DeckDraft>({ name: '', description: '' })
const errors = ref<Record<string, string>>({})
const saving = ref(false)

const isEdit = computed(() => editing.value !== null)
const title = computed(() => (isEdit.value ? 'Редактирование колоды' : 'Новая колода'))

watch(isOpen, (open) => {
  if (!open) return
  const source = editing.value
  draft.name = source?.name ?? ''
  draft.description = source?.description ?? ''
  errors.value = {}
})

function validate(): boolean {
  const name = draft.name.trim()
  const map: Record<string, string> = {}
  if (name.length === 0) map.name = 'Введите название колоды'
  else if (name.length > 60) map.name = 'Название не длиннее 60 символов'
  errors.value = map
  return Object.keys(map).length === 0
}

async function onSave(): Promise<void> {
  if (!validate()) return

  saving.value = true
  try {
    const payload: DeckDraft = {
      name: draft.name.trim(),
      description: draft.description.trim(),
    }

    if (editing.value) {
      await store.update(editing.value.id, payload)
      toast.add({ severity: 'success', summary: 'Сохранено', detail: 'Колода обновлена', life: 3000 })
    } else {
      await store.create(payload)
      toast.add({ severity: 'success', summary: 'Создано', detail: 'Колода добавлена', life: 3000 })
    }
    close()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: store.error ?? 'Не удалось сохранить колоду',
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}

function onVisibilityChange(value: boolean): void {
  if (!value) close()
}
</script>

<template>
  <Dialog
    :visible="isOpen"
    :header="title"
    modal
    :draggable="false"
    :style="{ width: '30rem' }"
    :breakpoints="{ '640px': '92vw' }"
    @update:visible="onVisibilityChange"
  >
    <form class="deck-form" @submit.prevent="onSave">
      <div class="deck-form__field">
        <label for="deck-name">Название<span class="deck-form__req">*</span></label>
        <InputText
          id="deck-name"
          v-model="draft.name"
          :invalid="Boolean(errors.name)"
          autocomplete="off"
          maxlength="60"
          fluid
        />
        <small v-if="errors.name" class="deck-form__error">{{ errors.name }}</small>
      </div>

      <div class="deck-form__field">
        <label for="deck-description">Описание</label>
        <Textarea id="deck-description" v-model="draft.description" rows="3" auto-resize fluid />
      </div>
    </form>

    <template #footer>
      <Button label="Отмена" severity="secondary" text @click="close" />
      <Button label="Сохранить" icon="pi pi-check" :loading="saving" @click="onSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.deck-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.25rem;
}

.deck-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.deck-form__field label {
  font-size: 0.85rem;
  font-weight: 600;
}

.deck-form__req {
  color: var(--p-red-400, #f87171);
  margin-left: 0.15rem;
}

.deck-form__error {
  color: var(--p-red-400, #f87171);
  font-size: 0.8rem;
}
</style>
