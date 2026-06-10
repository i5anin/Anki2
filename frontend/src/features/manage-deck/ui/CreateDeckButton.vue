<script setup lang="ts">
import Button from 'primevue/button'

import { useManageDeck } from '../model/useManageDeck'

const { openCreate } = useManageDeck()
</script>

<template>
  <Button label="Новая колода" icon="pi pi-plus" @click="openCreate" />
</template>
