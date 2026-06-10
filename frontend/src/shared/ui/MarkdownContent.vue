<script setup lang="ts">
import { computed } from 'vue'

import { renderMarkdown } from '@/shared/lib'

const props = defineProps<{ source: string }>()

const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <!-- Источник — собственный Markdown карточки (markdown-it, html:false), безопасно. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown" v-html="html" />
</template>

<style scoped>
.markdown {
  font-size: 1.05rem;
  line-height: 1.6;
  word-break: break-word;
}

.markdown :deep(p) {
  margin: 0.4em 0;
}

.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3) {
  margin: 0.6em 0 0.3em;
  line-height: 1.25;
}

.markdown :deep(pre) {
  margin: 0.6em 0;
  padding: 0.85rem 1rem;
  border-radius: 0.6rem;
  background: var(--app-code-bg, #1e1e2e);
  overflow-x: auto;
  font-size: 0.92em;
}

.markdown :deep(code) {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.markdown :deep(:not(pre) > code) {
  padding: 0.12em 0.38em;
  border-radius: 0.35rem;
  background: color-mix(in srgb, var(--app-muted) 22%, transparent);
  font-size: 0.9em;
}

.markdown :deep(blockquote) {
  margin: 0.6em 0;
  padding: 0.2em 0.9em;
  border-left: 3px solid var(--p-primary-color, #6366f1);
  color: var(--app-muted);
}

.markdown :deep(table) {
  border-collapse: collapse;
  margin: 0.6em 0;
}

.markdown :deep(th),
.markdown :deep(td) {
  border: 1px solid var(--app-border);
  padding: 0.35rem 0.6rem;
}

.markdown :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
}

.markdown :deep(.katex-display) {
  margin: 0.6em 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.markdown :deep(hr) {
  border: none;
  border-top: 1px solid var(--app-border);
  margin: 0.8em 0;
}
</style>
