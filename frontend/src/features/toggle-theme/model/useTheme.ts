import { useStorage } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

const DARK_CLASS = 'app-dark'
const STORAGE_KEY = 'anki2:theme'

type ThemeMode = 'dark' | 'light'

const theme = useStorage<ThemeMode>(STORAGE_KEY, 'dark')

// Синхронизация класса темы с <html> — один раз на модуль.
if (typeof document !== 'undefined') {
  watchEffect(() => {
    document.documentElement.classList.toggle(DARK_CLASS, theme.value === 'dark')
  })
}

/** Доступ к текущей теме и её переключению. По умолчанию — тёмная. */
export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function toggle(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, isDark, toggle }
}
