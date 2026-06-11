<script setup lang="ts">
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'

import { useBlitzHub } from '../model/useBlitzHub'

const { isLoading, error, cards, total, selected, selectedCount, play, playMix, clearSelection } =
  useBlitzHub()
</script>

<template>
  <div class="blitz-hub">
    <header class="blitz-hub__head">
      <h1 class="blitz-hub__title">Блиц</h1>
      <p class="blitz-hub__subtitle">
        Короткие вопросы с вариантами и таймером — разминка-узнавание перед глубоким повторением.
      </p>
    </header>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="isLoading" class="blitz-hub__grid">
      <Skeleton v-for="n in 6" :key="n" height="9rem" border-radius="0.75rem" />
    </div>

    <template v-else>
      <button type="button" class="blitz-hub__mixed" @click="play('all')">
        <span class="blitz-hub__mixed-icon"><i class="pi pi-bolt" /></span>
        <span class="blitz-hub__mixed-text">
          <span class="blitz-hub__mixed-title">Вперемешку</span>
          <span class="blitz-hub__mixed-sub">{{ total }} вопросов по всем темам</span>
        </span>
        <i class="pi pi-arrow-right" />
      </button>

      <p class="blitz-hub__hint">
        Отметьте несколько тем, чтобы собрать из них один тест — или нажмите «Начать» для одной.
      </p>

      <div class="blitz-hub__grid">
        <article
          v-for="card in cards"
          :key="card.slug"
          class="blitz-hub__card"
          :class="{ 'blitz-hub__card--picked': selected.includes(card.slug) }"
        >
          <header class="blitz-hub__card-head">
            <span class="blitz-hub__card-icon"><i :class="card.icon" /></span>
            <Checkbox
              v-model="selected"
              :value="card.slug"
              :disabled="card.count === 0"
              :aria-label="`Добавить «${card.label}» в тест`"
            />
          </header>
          <h2 class="blitz-hub__card-title">{{ card.label }}</h2>
          <span class="blitz-hub__card-count">{{ card.count }} вопросов</span>
          <Button
            label="Начать"
            icon="pi pi-play"
            size="small"
            fluid
            :disabled="card.count === 0"
            @click="play(card.slug)"
          />
        </article>
      </div>
    </template>

    <Transition name="blitz-bar">
      <div v-if="selected.length > 0" class="blitz-hub__bar">
        <span class="blitz-hub__bar-text">
          <strong>{{ selected.length }}</strong> тем · {{ selectedCount }} вопросов
        </span>
        <Button label="Сбросить" severity="secondary" text size="small" @click="clearSelection" />
        <Button label="Собрать тест" icon="pi pi-play" size="small" @click="playMix" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.blitz-hub {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.blitz-hub__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.blitz-hub__subtitle {
  margin: 0.35rem 0 0;
  color: var(--app-muted);
}

.blitz-hub__mixed {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.85rem;
  background: var(--app-surface);
  color: var(--app-text);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease;
}

.blitz-hub__mixed:hover {
  border-color: var(--p-primary-color, #6366f1);
}

.blitz-hub__mixed-icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.7rem;
  background: var(--p-primary-color, #6366f1);
  color: #fff;
  font-size: 1.3rem;
}

.blitz-hub__mixed-text {
  display: flex;
  flex-direction: column;
}

.blitz-hub__mixed-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.blitz-hub__mixed-sub {
  color: var(--app-muted);
  font-size: 0.85rem;
}

.blitz-hub__mixed i.pi-arrow-right {
  margin-left: auto;
  color: var(--app-muted);
}

.blitz-hub__hint {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.88rem;
}

.blitz-hub__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
}

.blitz-hub__card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.blitz-hub__card--picked {
  border-color: var(--p-primary-color, #6366f1);
  box-shadow: 0 0 0 1px var(--p-primary-color, #6366f1);
}

.blitz-hub__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.blitz-hub__card-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.6rem;
  background: color-mix(in srgb, var(--p-primary-color, #6366f1) 16%, transparent);
  color: var(--p-primary-color, #6366f1);
  font-size: 1.2rem;
}

.blitz-hub__card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.blitz-hub__card-count {
  color: var(--app-muted);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.blitz-hub__bar {
  position: sticky;
  bottom: 1rem;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: 0.85rem;
  background: var(--app-surface);
  box-shadow: 0 12px 32px -16px rgb(0 0 0 / 45%);
}

.blitz-hub__bar-text {
  margin-right: auto;
  color: var(--app-muted);
  font-size: 0.9rem;
}

.blitz-hub__bar-text strong {
  color: var(--app-text);
  font-size: 1.05rem;
}

.blitz-bar-enter-active,
.blitz-bar-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.blitz-bar-enter-from,
.blitz-bar-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
</style>
