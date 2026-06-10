# Anki2

Аналог Anki — приложение интервального повторения карточек. Клиент-серверная
архитектура коммерческого уровня: **NestJS + Vue 3 + Supabase**.

> Без авторизации (этап 1). Архитектура готова к добавлению Supabase Auth + RLS.

## Возможности

- 🗂️ **Колоды** со счётчиками new / learning / review и лимитами в день.
- 🧠 **SRS-планировщик** (SM-2 с ease-фактором): learning / review / relearning,
  оценки Again / Hard / Good / Easy, предпросмотр интервалов на кнопках.
- ✍️ **Заметки и модели** (как в Anki): одна заметка по шаблонам порождает
  несколько карточек. Встроенные модели: Basic, Basic (and reversed), Cloze.
- 🎨 **Красивые карточки**: Markdown + формулы KaTeX + подсветка кода.
- 🛠️ **Удобный редактор**: поля + живой предпросмотр.
- 📊 **Статистика**: удержание, прогноз нагрузки, история повторений, распределение.
- 🌗 Тёмная/светлая тема, адаптивный интерфейс на PrimeVue.

## Стек

| Слой     | Технологии                                                          |
|----------|---------------------------------------------------------------------|
| Frontend | Vue 3.5 · TypeScript · Vite · PrimeVue 4 (Aura) · Pinia · FSD       |
| Backend  | NestJS 11 · `@supabase/supabase-js` · class-validator · Swagger     |
| БД       | Supabase (PostgreSQL), схема `anki`                                  |
| Карточки | markdown-it · KaTeX · highlight.js · Chart.js                       |

## Структура

```
Anki2/
├── backend/    REST API на NestJS (модули + SRS-движок + абстракция данных)
├── frontend/   SPA на Vue 3 (Feature-Sliced Design)
├── supabase/   schema.sql, seed.sql, инструкция по настройке
└── docs/       ARCHITECTURE.md, SRS.md
```

## Быстрый старт

Требуется Node ≥ 20 (проверено на 24).

### 1. Установка

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 2. База данных

- **Демо без ключей:** ничего не нужно — backend поднимет in-memory хранилище
  с демо-карточками.
- **Боевой Supabase:** выполните шаги из [`supabase/README.md`](./supabase/README.md)
  (применить `schema.sql` + `seed.sql`, открыть схему `anki`, вписать
  `service_role` в `backend/.env`).

### 3. Запуск

```bash
# терминал 1 — API на http://localhost:3000 (Swagger: /api/docs)
npm run dev --prefix backend

# терминал 2 — клиент на http://localhost:5173
npm run dev --prefix frontend
```

Откройте http://localhost:5173.

## Документация

- [Архитектура](./docs/ARCHITECTURE.md) — модель данных, слои, API, решения.
- [Алгоритм SRS](./docs/SRS.md) — планировщик, конфигурация, переходы.
- [Настройка Supabase](./supabase/README.md).

## Тесты

```bash
npm test --prefix backend     # unit-тесты SRS-движка (jest)
npm run type-check --prefix backend
npm run type-check --prefix frontend
```

## Дальше (вне этапа 1)

Авторизация (Supabase Auth + RLS), синхронизация, импорт `.apkg`, медиа,
FSRS, мобильный клиент, общие колоды.
