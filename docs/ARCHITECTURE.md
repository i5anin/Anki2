# Архитектура Anki2

Аналог Anki: интервальное повторение карточек. Клиент-серверное приложение,
коммерческого уровня, без авторизации (этап 1).

## Стек

| Слой       | Технологии                                                            |
|------------|-----------------------------------------------------------------------|
| Frontend   | Vue 3.5 · TypeScript · Vite 8 · PrimeVue 4 (Aura) · Pinia · zod · FSD |
| Backend    | NestJS 11 · `@supabase/supabase-js` · class-validator · Swagger       |
| БД         | Supabase (PostgreSQL), схема `anki`                                    |
| Карточки   | markdown-it · KaTeX · highlight.js                                     |
| Статистика | Chart.js (через PrimeVue `Chart`)                                     |

Один проект Supabase общий с `crm_final_vue`; изоляция — через выделенную
схему `anki` (CRM живёт в `public`).

## Слои и поток данных

```
Vue (FSD) ──HTTP/JSON──▶ NestJS REST (/api) ──supabase-js──▶ Postgres (anki.*)
   │                          │
   │ markdown+KaTeX рендер     │ SRS-движок (чистые функции), генерация карточек
   ▼                          ▼
 красивая карточка        планирование + журнал повторений
```

Граница ответственности:
- **Логика планирования и генерации карточек** — на сервере (single source of truth).
- **Подстановка полей шаблона `{{Field}}` и cloze** — на сервере; наружу отдаётся
  готовый Markdown (`frontMarkdown` / `backMarkdown`).
- **Рендер Markdown → HTML, формулы, подсветка** — на клиенте (presentation).

## Доменная модель (как в Anki)

```
note_type (модель: поля + шаблоны)
    │ 1..N
note (значения полей + теги, принадлежит колоде)
    │ 1..N  (по шаблонам генерируются карточки)
card (состояние планировщика: ease, interval, due, ...)
    │ 1..N
review_log (история повторений)

deck ──< note ──< card ──< review_log
```

- **note_type** — определяет поля (`["Front","Back"]`) и шаблоны
  (`[{name, front, back}]`). Встроенные: `Basic`, `Basic (and reversed)`, `Cloze`.
- **note** — конкретные значения полей. Одна заметка по шаблонам порождает
  одну или несколько карточек (напр. прямую и обратную).
- **card** — единица планирования (поля SRS: `state`, `due`, `interval_days`,
  `ease_factor`, `reps`, `lapses`, `learning_step`).
- **review_log** — запись каждого ответа (для статистики удержания).

Алгоритм планирования описан в [SRS.md](./SRS.md).

## REST API (`/api`)

| Метод и путь                       | Назначение                                   |
|------------------------------------|----------------------------------------------|
| `GET /decks`                       | список колод с счётчиками due/new            |
| `POST /decks` · `PATCH/DELETE /decks/:id` | CRUD колод                            |
| `GET /decks/:id/stats`             | статистика по колоде                         |
| `GET /note-types` · CRUD           | модели заметок                               |
| `GET /notes` (`?deckId`) · CRUD    | заметки; create/update регенерирует карточки |
| `GET /cards` (`?deckId&state`)     | обзор карточек                               |
| `PATCH /cards/:id`                 | перенос в колоду / suspend                   |
| `GET /study/:deckId/queue`         | очередь к показу (с готовым Markdown)        |
| `GET /study/:deckId/preview/:cardId` | интервалы для 4 кнопок оценки              |
| `POST /study/review`               | применить оценку → SRS + журнал              |
| `GET /stats/overview`              | сводка: всего/изучено/удержание              |
| `GET /stats/forecast`              | прогноз нагрузки по дням                      |
| `GET /stats/retention`             | удержание по оценкам                          |

Глобальный префикс `api`, CORS, `ValidationPipe` (whitelist+transform),
ошибки валидации → HTTP 422 `{ errors: [{ field, message }] }`. Swagger — `/api/docs`.

## Frontend (Feature-Sliced Design)

```
src/
  app/        провайдеры (PrimeVue, Pinia, router), стили, App.vue
  pages/      decks · study · browse · stats · note-types · not-found
  widgets/    app-sidebar · decks-grid · study-card · notes-table · stats-*
  features/   manage-deck · study-session · manage-note (редактор) · ...
  entities/   deck · note · card · note-type · review (types/api/store/schema)
  shared/     api(http) · config · lib(markdown, format, srs-format) · ui(MarkdownContent)
```

Слои зависят только «вниз»: `app → pages → widgets → features → entities → shared`.
Публичный API каждого среза — через `index.ts`.

## Решения и трейдоффы

| Вопрос                | Выбор                          | Альтернатива и почему нет                         |
|-----------------------|--------------------------------|---------------------------------------------------|
| ORM vs supabase-js    | `supabase-js`                  | Prisma/TypeORM — лишний слой; «всё через Supabase» |
| Изоляция данных       | схема `anki`                   | префикс `anki_` в `public` — мусор в общей схеме   |
| SRS                   | SM-2 (ease-фактор)             | FSRS — мощнее, но «коэффициенты» = SM-2; путь роста |
| Подстановка шаблона   | на сервере                     | на клиенте — дублирование логики                   |
| Рендер Markdown       | на клиенте                     | на сервере — теряем интерактивность/KaTeX          |
| Редактор              | textarea + панель + предпросмотр| CodeMirror — тяжелее, хрупкая интеграция            |

## Режимы отказа

| Сбой                                | Поведение                                            |
|-------------------------------------|------------------------------------------------------|
| Не задан `SUPABASE_SERVICE_ROLE_KEY`| сервер стартует, баннер предупреждает, запросы → 500  |
| Схема `anki` не открыта в API       | supabase-js → ошибка PGRST106; описано в `supabase/README` |
| Пустая очередь повторений           | UI показывает «всё повторено», предлагает статистику   |
| Невалидный шаблон/поле              | подстановка оставляет плейсхолдер, карточка не падает  |
| Конкурентный ответ на карточку      | планирование идемпотентно по текущему состоянию карты  |

## Дальнейшее развитие (вне этапа 1)

Авторизация (Supabase Auth + RLS по `user_id`), синхронизация, импорт `.apkg`,
медиа-вложения, FSRS, мобильный клиент, общие колоды/маркетплейс, биллинг.
