<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDecksStore } from '@/entities/deck'
import { useNotesStore, type Note } from '@/entities/note'
import { useNoteTypesStore, type NoteType } from '@/entities/note-type'
import { AddNoteButton, NoteEditorDialog, useManageNote } from '@/features/manage-note'
import { useDeleteNote } from '@/features/delete-note'
import { formatDateTime } from '@/shared/lib'
import { MarkdownContent } from '@/shared/ui'

interface NoteRow {
  note: Note
  front: string
  modelName: string
  tags: string[]
  tagsText: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()

const notesStore = useNotesStore()
const noteTypesStore = useNoteTypesStore()
const decksStore = useDecksStore()

const { openEdit } = useManageNote()
const { confirmDelete } = useDeleteNote()

const deckId = computed(() => String(route.params.deckId))
const search = ref('')

const noteTypeMap = computed(
  () => new Map<string, NoteType>(noteTypesStore.noteTypes.map((type) => [type.id, type])),
)

const deckName = computed(
  () => decksStore.decks.find((deck) => deck.id === deckId.value)?.name ?? 'Колода',
)

/** Содержимое лицевой стороны: первое поле модели или первое значение fields. */
function frontField(note: Note): string {
  const type = noteTypeMap.value.get(note.noteTypeId)
  const firstField = type?.fields[0]
  if (firstField && note.fields[firstField] !== undefined) return note.fields[firstField]
  return Object.values(note.fields)[0] ?? ''
}

function modelName(note: Note): string {
  return noteTypeMap.value.get(note.noteTypeId)?.name ?? '—'
}

const rows = computed<NoteRow[]>(() =>
  notesStore.notes.map((note) => ({
    note,
    front: frontField(note),
    modelName: modelName(note),
    tags: note.tags,
    tagsText: note.tags.join(' '),
    updatedAt: note.updatedAt,
  })),
)

const filters = computed(() => ({
  global: { value: search.value.trim() || null, matchMode: 'contains' as const },
}))

onMounted(() => {
  void Promise.all([
    notesStore.fetchAll(deckId.value),
    noteTypesStore.fetchAll(),
    decksStore.fetchAll(),
  ])
})

function goBack(): void {
  void router.push('/')
}
</script>

<template>
  <div class="browse-page">
    <header class="browse-page__header">
      <Button
        icon="pi pi-arrow-left"
        severity="secondary"
        text
        rounded
        aria-label="Назад"
        @click="goBack"
      />
      <h1 class="browse-page__title">{{ deckName }}</h1>
      <div class="browse-page__actions">
        <AddNoteButton :deck-id="deckId" />
      </div>
    </header>

    <ProgressBar v-if="notesStore.isLoading" mode="indeterminate" class="browse-page__progress" />

    <DataTable
      :value="rows"
      :filters="filters"
      :global-filter-fields="['front', 'modelName', 'tagsText']"
      :loading="notesStore.isLoading"
      data-key="note.id"
      paginator
      :rows="20"
      :rows-per-page-options="[20, 50, 100]"
      striped-rows
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      current-page-report-template="{first}–{last} из {totalRecords}"
      class="browse-page__table"
    >
      <template #header>
        <div class="browse-page__toolbar">
          <InputText v-model="search" placeholder="Поиск заметок" class="browse-page__search" />
        </div>
      </template>

      <template #empty>
        <div class="browse-page__empty">
          <i class="pi pi-inbox" />
          <p>В колоде пока нет заметок</p>
        </div>
      </template>

      <Column header="Лицевая">
        <template #body="{ data }">
          <MarkdownContent :source="data.front" />
        </template>
      </Column>

      <Column field="modelName" header="Модель" sortable>
        <template #body="{ data }">
          <span class="browse-page__muted">{{ data.modelName }}</span>
        </template>
      </Column>

      <Column header="Теги">
        <template #body="{ data }">
          <div class="browse-page__tags">
            <Tag v-for="tag in data.tags" :key="tag" :value="tag" severity="secondary" />
            <span v-if="data.tags.length === 0" class="browse-page__muted">—</span>
          </div>
        </template>
      </Column>

      <Column field="updatedAt" header="Изменена" sortable>
        <template #body="{ data }">
          <span class="browse-page__muted">{{ formatDateTime(data.updatedAt) }}</span>
        </template>
      </Column>

      <Column header="Действия" :exportable="false" style="width: 7rem">
        <template #body="{ data }">
          <div class="browse-page__row-actions">
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              text
              rounded
              aria-label="Изменить"
              @click="openEdit(data.note)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              aria-label="Удалить"
              @click="confirmDelete(data.note)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <NoteEditorDialog />
  </div>
</template>

<style scoped>
.browse-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.browse-page__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.browse-page__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.browse-page__actions {
  margin-left: auto;
}

.browse-page__progress {
  height: 0.25rem;
}

.browse-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.browse-page__search {
  width: min(320px, 100%);
}

.browse-page__muted {
  color: var(--app-muted);
  white-space: nowrap;
}

.browse-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.browse-page__row-actions {
  display: flex;
  gap: 0.25rem;
}

.browse-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: var(--app-muted);
}

.browse-page__empty i {
  font-size: 2rem;
}
</style>
