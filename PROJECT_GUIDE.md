# Путеводитель: Anki2

Автономная инструкция: достаточно этой папки, исходников и перечисленных защищённых копий. История чатов и центральный каталог не требуются.

[Восстановление](RECOVERY.md) · [Карта файлов и зависимостей](PROJECT_MAP.json)

## Назначение

По [package.json](package.json): Anki2 — интервальное повторение (NestJS + Vue 3 + Supabase)

Обнаруженные языки: JavaScript, TypeScript, Vue SFC.

## Порядок чтения

1. Локальные AGENTS.md / CLAUDE.md и документы ниже.
2. Манифесты: версии среды, зависимости, команды.
3. Кандидаты точек входа; фактический запуск проверить по манифесту.
4. PROJECT_MAP.json: imports_local от источника к импортируемому файлу; входящие рёбра — потребители модуля.
5. RECOVERY.md: независимые данные, восстановление среды, запуск и критерии приёмки.

- [README.md](README.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [supabase/README.md](supabase/README.md)

## Манифесты

- [package.json](package.json)
- [backend/package.json](backend/package.json)
- [frontend/package.json](frontend/package.json)

## Кандидаты точек входа

- [backend/api/index.ts](backend/api/index.ts)
- [backend/src/main.ts](backend/src/main.ts)
- [frontend/src/main.ts](frontend/src/main.ts)

## Основные файлы по локальным импортам

| Файл | Входящих импортов |
|---|---:|
| [backend/src/srs/index.ts](backend/src/srs/index.ts) | 18 |
| [backend/src/domain/note.entity.ts](backend/src/domain/note.entity.ts) | 16 |
| [backend/src/store/data-store.ts](backend/src/store/data-store.ts) | 16 |
| [backend/src/domain/card.entity.ts](backend/src/domain/card.entity.ts) | 14 |
| [backend/src/domain/note-type.entity.ts](backend/src/domain/note-type.entity.ts) | 12 |
| [backend/src/domain/deck.entity.ts](backend/src/domain/deck.entity.ts) | 11 |
| [backend/src/domain/quiz-item.entity.ts](backend/src/domain/quiz-item.entity.ts) | 8 |
| [backend/src/domain/review-log.entity.ts](backend/src/domain/review-log.entity.ts) | 8 |
| [backend/src/domain/trainer-result.entity.ts](backend/src/domain/trainer-result.entity.ts) | 8 |
| [backend/src/srs/types.ts](backend/src/srs/types.ts) | 4 |
| [backend/src/app.module.ts](backend/src/app.module.ts) | 3 |
| [backend/src/rendering/index.ts](backend/src/rendering/index.ts) | 3 |

## Проверки

- [backend/src/srs/scheduler.spec.ts](backend/src/srs/scheduler.spec.ts)

## Чтение карты без специальных плагинов

PROJECT_MAP.json — UTF-8 JSON: nodes и edges. Пути файлов относительные. contains обозначает наличие файла; imports_local — статически распознанный импорт; declares_dependency — объявление пакета в манифесте. evidence содержит источник и, где доступно, строку. Карта не исполняет код.

Статус исходного анализа: static-scan-complete; ограничений чтения: 0. Исходный снимок: 2026-10-30T14:47:11.360Z.

После изменения кода перечитайте затронутые файлы: карта является снимком. Отсутствие ребра не доказывает отсутствие зависимости.
