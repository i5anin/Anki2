<script setup lang="ts">
import Button from 'primevue/button'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(): void {
  void router.push('/')
}
</script>

<template>
  <section class="not-found">
    <span class="not-found__logo"><i class="pi pi-compass" /></span>
    <p class="not-found__code">404</p>
    <h1 class="not-found__title">Страница не найдена</h1>
    <p class="not-found__hint">Возможно, ссылка устарела или была введена с ошибкой.</p>
    <Button label="На главную" icon="pi pi-home" @click="goHome" />
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  text-align: center;
}

.not-found__logo {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--p-primary-color, #6366f1) 16%, transparent);
  color: var(--p-primary-color, #6366f1);
  font-size: 1.6rem;
}

.not-found__code {
  margin: 0.5rem 0 0;
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--app-muted);
}

.not-found__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.not-found__hint {
  margin: 0 0 0.5rem;
  color: var(--app-muted);
}
</style>
