<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { RouterView } from 'vue-router'

import { useTheme } from '@/features/toggle-theme'
import { AppLayout } from '@/widgets/app-layout'

// Инициализирует синхронизацию темы с <html>.
useTheme()
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toast position="top-right" />
  <ConfirmDialog />
</template>
