<script setup lang="ts">
import { ThemeToggle } from '@/features/toggle-theme'
import { config } from '@/shared/config'

interface NavLink {
  to: string
  label: string
  icon: string
}

const links: NavLink[] = [
  { to: '/', label: 'Колоды', icon: 'pi pi-clone' },
  { to: '/quiz', label: 'Блиц', icon: 'pi pi-bolt' },
  { to: '/trainers', label: 'Тренажёры', icon: 'pi pi-bullseye' },
  { to: '/stats', label: 'Статистика', icon: 'pi pi-chart-bar' },
  { to: '/note-types', label: 'Модели', icon: 'pi pi-table' },
]
</script>

<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar">
      <RouterLink to="/" class="app-layout__brand">
        <span class="app-layout__logo"><i class="pi pi-bolt" /></span>
        <span class="app-layout__title">{{ config.appTitle }}</span>
      </RouterLink>

      <nav class="app-layout__nav">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="app-layout__link"
        >
          <i :class="link.icon" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>

      <div class="app-layout__footer">
        <ThemeToggle />
      </div>
    </aside>

    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;
  min-height: 100vh;
}

.app-layout__sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100vh;
  padding: 1.25rem 1rem;
  background: var(--app-surface);
  border-right: 1px solid var(--app-border);
}

.app-layout__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem;
  color: inherit;
  font-weight: 700;
  text-decoration: none;
}

.app-layout__logo {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.6rem;
  background: var(--p-primary-color, #6366f1);
  color: var(--p-primary-contrast-color, #fff);
}

.app-layout__title {
  font-size: 1.15rem;
  white-space: nowrap;
}

.app-layout__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-layout__link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.6rem;
  color: var(--app-muted);
  font-weight: 600;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.app-layout__link:hover {
  background: color-mix(in srgb, var(--app-muted) 14%, transparent);
  color: var(--app-text, inherit);
}

.app-layout__link.router-link-active {
  background: color-mix(in srgb, var(--p-primary-color, #6366f1) 16%, transparent);
  color: var(--p-primary-color, #6366f1);
}

.app-layout__footer {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.app-layout__main {
  min-width: 0;
}

@media (max-width: 860px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-layout__sidebar {
    position: sticky;
    top: 0;
    z-index: 10;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    height: auto;
    padding: 0.6rem 1rem;
    border-right: none;
    border-bottom: 1px solid var(--app-border);
    background: color-mix(in srgb, var(--app-surface) 88%, transparent);
    backdrop-filter: blur(8px);
    overflow-x: auto;
  }

  .app-layout__nav {
    flex-direction: row;
    gap: 0.25rem;
  }

  .app-layout__link span {
    display: none;
  }

  .app-layout__footer {
    margin-top: 0;
    margin-left: auto;
  }
}
</style>
