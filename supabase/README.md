# Supabase — настройка БД Anki2

Anki2 использует тот же проект Supabase, что и Nexus CRM, но в **отдельной
схеме `anki`** (CRM живёт в `public`) — данные не пересекаются.

## Шаги

1. **Применить схему.** Supabase Dashboard → **SQL Editor** → вставить
   содержимое [`schema.sql`](./schema.sql) → **Run**.

2. **Засеять встроенные модели и демо-карточки.** Там же выполнить
   [`seed.sql`](./seed.sql).

3. **Открыть схему для API.** Dashboard → **Project Settings → API →
   Exposed schemas** → добавить `anki` рядом с `public` → **Save**.
   Без этого `supabase-js` вернёт ошибку `PGRST106` (schema not exposed).

4. **Прописать ключ в бэкенде.** Скопировать `backend/.env.example` →
   `backend/.env` и вставить **service_role**-ключ
   (Dashboard → Project Settings → API → `service_role`):

   ```dotenv
   SUPABASE_URL=https://prhiqnxuqgrsxzjrxhht.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<секретный service_role>
   SUPABASE_SCHEMA=anki
   ```

   > ⚠️ `service_role` обходит RLS и должен жить **только** на сервере.
   > Он в `.gitignore` — не коммить.

## Без Supabase (демо-режим)

Если `SUPABASE_SERVICE_ROLE_KEY` не задан, бэкенд автоматически поднимает
**in-memory** хранилище с теми же демо-данными — приложение полностью
работает локально без ключей и без обращения к БД. Это удобно для разработки
и демонстрации; переключение на Supabase — простое заполнение `.env`.

## Модель данных

```
anki.note_types ──< anki.notes ──< anki.cards ──< anki.review_logs
anki.decks ──< anki.notes
anki.decks ──< anki.cards
```

Подробности — в [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).
RLS включён на всех таблицах; политик для `anon` нет — доступ только через
backend под `service_role`.
