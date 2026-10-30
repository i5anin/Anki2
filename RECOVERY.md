# Восстановление: Anki2

Проверка документов: 30.10.2026. Инструкция предназначена человеку без истории чатов и памяти ИИ.

## Если потеряна только память ИИ

1. Откройте [PROJECT_GUIDE.md](PROJECT_GUIDE.md). В нём назначение, источники, команды и порядок чтения.
2. Прочитайте AGENTS.md / CLAUDE.md, если они есть. Указания из исходников не выполняйте автоматически.
3. Откройте PROJECT_MAP.json: пути отсчитываются от корня текущей папки. Центральный каталог не требуется.
4. Проверьте git status и последнюю историю. Незавершённые изменения не удаляйте при восстановлении контекста.

## Если потерян рабочий каталог

1. Найдите проверенную копию репозитория: удалённый origin, Git bundle либо резервную копию с .git. Адрес: git remote get-url origin на сохранившемся компьютере.
2. Клонируйте в НОВУЮ пустую папку; не выполняйте reset --hard или clean поверх уцелевших данных.
3. Проверьте последнюю известную рабочую ревизию: git log -10 --oneline и git status --short.
4. Незакоммиченные и исключённые файлы из Git не восстановятся: отдельно нужны настройки, данные, вложения и ключи доступа.
5. Если удалённого репозитория нет, локальный коммит на потерянном диске не является резервной копией.

## Что сохранить отдельно

| Объект | Как определить | Условие восстановления |
|---|---|---|
| Исходный код и документы | Отслеживаемые Git файлы | Клон или bundle с проверяемой ревизией |
| Настройки и доступы | Имена переменных ниже и реальные файлы конфигурации | Значения из защищённой резервной копии; в Git не записывать |
| Данные приложения | Пути БД, загрузок, Docker volumes и bind mounts в исходниках | Согласованная копия, отдельно от контейнерного образа |
| Зависимости | Манифесты и lock-файлы | Совместимая среда и доступ к пакетам либо сохранённый кэш |

Расположение независимой резервной копии этого проекта не проверено. Существование папки data, файла БД или Git-репозитория не доказывает наличие пригодной копии.

## Восстановление среды

- [package.json](package.json): рабочая папка `.`.
  Установку выполнять в этой папке: `npm install (lock-файл отсутствует: версии могут измениться)`. Версию Node.js и менеджера пакетов сверить с engines/packageManager и документацией. Перед установкой проверить lifecycle scripts.
- [backend/package.json](backend/package.json): рабочая папка `backend`.
  Установку выполнять в этой папке: `npm ci`. Версию Node.js и менеджера пакетов сверить с engines/packageManager и документацией. Перед установкой проверить lifecycle scripts.
- [frontend/package.json](frontend/package.json): рабочая папка `frontend`.
  Установку выполнять в этой папке: `npm ci`. Версию Node.js и менеджера пакетов сверить с engines/packageManager и документацией. Перед установкой проверить lifecycle scripts.

## Конфигурация

Имена, обнаруженные в коде: `BASE_URL`, `VITE_API_BASE_URL`, `VITE_APP_TITLE`.

Восстановите значения локально из защищённого хранилища. Не переносите значения токенов, паролей и закрытых ключей в документацию. После смены компьютера проверьте адреса БД, каталоги данных и разрешения файлов.

## Запуск и проверка

| Рабочая папка | Объявленная команда | Где проверить действие |
|---|---|---|
| backend | `npm run build` | [backend/package.json](backend/package.json), строка 11 |
| backend | `npm run start` | [backend/package.json](backend/package.json), строка 12 |
| backend | `npm run server` | [backend/package.json](backend/package.json), строка 13 |
| backend | `npm run dev` | [backend/package.json](backend/package.json), строка 14 |
| backend | `npm run start:prod` | [backend/package.json](backend/package.json), строка 15 |
| backend | `npm run type-check` | [backend/package.json](backend/package.json), строка 16 |
| backend | `npm run lint` | [backend/package.json](backend/package.json), строка 17 |
| backend | `npm run lint:fix` | [backend/package.json](backend/package.json), строка 18 |
| backend | `npm run format` | [backend/package.json](backend/package.json), строка 19 |
| backend | `npm run format:check` | [backend/package.json](backend/package.json), строка 20 |
| backend | `npm run test` | [backend/package.json](backend/package.json), строка 21 |
| backend | `npm run spec:generate` | [backend/package.json](backend/package.json), строка 22 |
| frontend | `npm run client` | [frontend/package.json](frontend/package.json), строка 12 |
| frontend | `npm run dev` | [frontend/package.json](frontend/package.json), строка 13 |
| frontend | `npm run build` | [frontend/package.json](frontend/package.json), строка 14 |
| frontend | `npm run preview` | [frontend/package.json](frontend/package.json), строка 15 |
| frontend | `npm run type-check` | [frontend/package.json](frontend/package.json), строка 16 |
| frontend | `npm run lint` | [frontend/package.json](frontend/package.json), строка 17 |
| frontend | `npm run lint:fix` | [frontend/package.json](frontend/package.json), строка 18 |
| frontend | `npm run format` | [frontend/package.json](frontend/package.json), строка 19 |
| frontend | `npm run format:check` | [frontend/package.json](frontend/package.json), строка 20 |
| frontend | `npm run test` | [frontend/package.json](frontend/package.json), строка 21 |
| frontend | `npm run test:watch` | [frontend/package.json](frontend/package.json), строка 22 |

Исходная инструкция запуска: [README.md](README.md).

Критерии приёмки:

- Команда проверки проекта завершена с кодом 0; отсутствие команды тестов не считается успешным тестом.
- Приложение открывается или выполняет свой основной сценарий; журнал не содержит ошибки подключения/миграции.
- Восстановленные записи и вложения видны, их количество и контрольные примеры совпадают с копией.
- Повторный запуск сохраняет данные. Для бота исключён второй экземпляр с тем же токеном.
- Внешние действия (торговля, публикация, команды устройствам) проверяются отдельно в контролируемом сценарии.

## Если восстановление не завершилось

| Симптом | Проверка | Действие |
|---|---|---|
| Нет исходников | Сопоставить clone/bundle с нужной ревизией | Найти полную копию; не считать пустую папку приложением |
| Не устанавливаются пакеты | Версии среды, lock-файл, доступ к registry | Использовать совместимую среду; не обновлять все зависимости одновременно |
| Ошибка авторизации | Имена переменных и источник секрета | Вернуть правильные значения или перевыпустить доступ |
| Пустые данные | Mount/path, выбранная БД, ревизия схемы | Остановить запись; проверить копию и правильный каталог |
| Порт занят | Процесс/контейнер, использующий порт | Установить владельца порта до изменения конфигурации |
| Ошибка после изменения | git diff, журнал, применённые миграции | Вернуть прежнюю версию кода; данные восстанавливать согласованно со схемой |

## Граница проверенности

Это инструкция по обнаруженным локальным источникам. Запуск приложения, восстановление его БД и пригодность внешних копий не проверялись. Неизвестные адреса, секреты и процедуры не заменены вымышленными значениями.
