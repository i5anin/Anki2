<script setup lang="ts">
import Button from 'primevue/button'

import { useManageNote } from '../model/useManageNote'

const props = defineProps<{ deckId?: string }>()

const { openCreate } = useManageNote()

function onClick(): void {
  openCreate(props.deckId)
}
</script>

<template>
  <Button label="Добавить заметку" icon="pi pi-plus" @click="onClick" />
</template>
