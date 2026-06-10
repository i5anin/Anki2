-- ============================================================================
-- Anki2 — схема базы данных (Supabase / PostgreSQL)
-- Изолированная схема `anki` в проекте, общем с Nexus CRM (CRM — в `public`).
--
-- Применение:
--   1) Supabase Dashboard → SQL Editor → вставить этот файл → Run.
--   2) Затем seed.sql (встроенные модели + демо-карточки).
--   3) Settings → API → "Exposed schemas" → добавить `anki` (иначе PGRST106).
--
-- Скрипт идемпотентен: повторный запуск не ломает существующие данные.
-- ============================================================================

create schema if not exists anki;

-- Общий триггер обновления updated_at -----------------------------------------
create or replace function anki.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Модели заметок (note types) -------------------------------------------------
create table if not exists anki.note_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  fields      jsonb not null default '[]'::jsonb,   -- ["Front","Back"]
  templates   jsonb not null default '[]'::jsonb,   -- [{name, front, back}]
  is_cloze    boolean not null default false,
  is_builtin  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Колоды ----------------------------------------------------------------------
create table if not exists anki.decks (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  config      jsonb not null default '{}'::jsonb,   -- DeckConfig (см. SRS.md)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Заметки ---------------------------------------------------------------------
create table if not exists anki.notes (
  id           uuid primary key default gen_random_uuid(),
  note_type_id uuid not null references anki.note_types(id) on delete restrict,
  deck_id      uuid not null references anki.decks(id) on delete cascade,
  fields       jsonb not null default '{}'::jsonb,  -- {"Front":"...","Back":"..."}
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Карточки (единица планирования) ---------------------------------------------
create table if not exists anki.cards (
  id               uuid primary key default gen_random_uuid(),
  note_id          uuid not null references anki.notes(id) on delete cascade,
  deck_id          uuid not null references anki.decks(id) on delete cascade,
  template_index   int not null default 0,
  state            text not null default 'new'
                     check (state in ('new','learning','review','relearning')),
  due              timestamptz not null default now(),
  interval_days    real not null default 0,
  ease_factor      real not null default 2.5,
  reps             int not null default 0,
  lapses           int not null default 0,
  learning_step    int not null default 0,
  is_suspended     boolean not null default false,
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (note_id, template_index)
);

-- Журнал повторений -----------------------------------------------------------
create table if not exists anki.review_logs (
  id              uuid primary key default gen_random_uuid(),
  card_id         uuid not null references anki.cards(id) on delete cascade,
  rating          smallint not null check (rating between 1 and 4),
  state_before    text not null,
  state_after     text not null,
  interval_before real not null default 0,
  interval_after  real not null default 0,
  ease_before     real not null default 0,
  ease_after      real not null default 0,
  elapsed_days    real not null default 0,
  time_taken_ms   int  not null default 0,
  reviewed_at     timestamptz not null default now()
);

-- Индексы ---------------------------------------------------------------------
create index if not exists idx_cards_deck  on anki.cards (deck_id);
create index if not exists idx_cards_note  on anki.cards (note_id);
create index if not exists idx_cards_queue on anki.cards (deck_id, state, due)
  where is_suspended = false;
create index if not exists idx_notes_deck  on anki.notes (deck_id);
create index if not exists idx_logs_card   on anki.review_logs (card_id, reviewed_at desc);
create index if not exists idx_logs_time   on anki.review_logs (reviewed_at);

-- Триггеры updated_at ---------------------------------------------------------
drop trigger if exists trg_note_types_updated on anki.note_types;
create trigger trg_note_types_updated before update on anki.note_types
  for each row execute function anki.set_updated_at();

drop trigger if exists trg_decks_updated on anki.decks;
create trigger trg_decks_updated before update on anki.decks
  for each row execute function anki.set_updated_at();

drop trigger if exists trg_notes_updated on anki.notes;
create trigger trg_notes_updated before update on anki.notes
  for each row execute function anki.set_updated_at();

drop trigger if exists trg_cards_updated on anki.cards;
create trigger trg_cards_updated before update on anki.cards
  for each row execute function anki.set_updated_at();

-- Права доступа ---------------------------------------------------------------
-- Backend ходит под ключом service_role (обходит RLS). Anon/authenticated
-- доступа не получают — приложение работает только через NestJS.
grant usage on schema anki to anon, authenticated, service_role;
grant all privileges on all tables    in schema anki to service_role;
grant all privileges on all sequences in schema anki to service_role;
grant all privileges on all functions in schema anki to service_role;
alter default privileges in schema anki grant all on tables    to service_role;
alter default privileges in schema anki grant all on sequences to service_role;

-- RLS: включаем; политик для anon нет → доступ закрыт (defense in depth).
alter table anki.note_types  enable row level security;
alter table anki.decks       enable row level security;
alter table anki.notes       enable row level security;
alter table anki.cards       enable row level security;
alter table anki.review_logs enable row level security;
