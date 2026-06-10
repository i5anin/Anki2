<script setup lang="ts">
import Button from 'primevue/button'
import { computed } from 'vue'

import { useTheme } from '../model/useTheme'

const { isDark, toggle } = useTheme()

const icon = computed(() => (isDark.value ? 'pi pi-sun' : 'pi pi-moon'))
</script>

<template>
  <Button
    :icon="icon"
    severity="secondary"
    text
    rounded
    aria-label="Переключить тему"
    @click="toggle"
  />
</template>
