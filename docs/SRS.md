# Алгоритм интервальных повторений (SRS)

Anki2 использует вариант **SM-2** (SuperMemo 2) в редакции, близкой к
планировщику Anki (SchedV2). Это «алгоритм с коэффициентами»: у каждой
карточки есть `ease_factor` (фактор лёгкости) — множитель, на который растёт
интервал при успешном вспоминании.

Ядро вынесено в чистый, не зависящий от БД модуль `backend/src/srs/` —
поэтому оно детерминировано и покрыто unit-тестами.

## Состояния карточки

| Состояние    | Смысл                                                        |
|--------------|--------------------------------------------------------------|
| `new`        | ещё ни разу не показана                                      |
| `learning`   | проходит шаги заучивания (минуты)                            |
| `review`     | в долгосрочном повторении (дни)                              |
| `relearning` | была забыта, проходит шаги переучивания                      |

Ортогональный флаг `is_suspended` исключает карточку из очереди.

## Оценки (rating)

| Код | Кнопка | Смысл                       |
|-----|--------|-----------------------------|
| 1   | Again  | не вспомнил                 |
| 2   | Hard   | вспомнил с трудом           |
| 3   | Good   | вспомнил нормально          |
| 4   | Easy   | вспомнил легко              |

## Конфигурация колоды (`DeckConfig`, значения по умолчанию)

| Поле                     | По умолчанию | Описание                                       |
|--------------------------|--------------|------------------------------------------------|
| `learningSteps`          | `[1, 10]`    | шаги заучивания, минуты                         |
| `relearningSteps`        | `[10]`       | шаги переучивания, минуты                       |
| `graduatingIntervalDays` | `1`          | интервал при «выпуске» из learning по Good      |
| `easyIntervalDays`       | `4`          | интервал при «выпуске» по Easy                  |
| `startingEase`           | `2.5`        | стартовый ease-фактор                           |
| `easyBonus`              | `1.3`        | доп. множитель для Easy в review                |
| `hardIntervalFactor`     | `1.2`        | множитель интервала для Hard в review           |
| `lapseIntervalMultiplier`| `0.0`        | доля старого интервала после провала            |
| `intervalModifier`       | `1.0`        | глобальный модификатор интервала                |
| `easeMinimum`            | `1.3`        | нижняя граница ease                             |
| `minimumIntervalDays`    | `1`          | минимальный интервал review                     |
| `maximumIntervalDays`    | `36500`      | максимум (100 лет)                              |
| `newCardsPerDay`         | `20`         | лимит новых карточек в день                     |
| `maxReviewsPerDay`       | `200`        | лимит повторений в день                         |

## Переходы

### NEW / LEARNING / RELEARNING (шаги в минутах)

Шаги берутся из `learningSteps` (для `new`/`learning`) или `relearningSteps`
(для `relearning`).

- **Again (1)** — на первый шаг: `step = 0`, `due = now + steps[0]`.
- **Hard (2)** — остаётся на текущем шаге: `due = now + steps[step]`
  (если `steps` пуст — повтор минимального интервала).
- **Good (3)** — `step += 1`. Если шаги закончились → «выпуск»:
  - из `learning` → `review`, `interval = graduatingIntervalDays`;
  - из `relearning` → `review`, `interval = max(minimumIntervalDays, intervalДоПровала)`.
  Иначе `due = now + steps[step]`.
- **Easy (4)** — немедленный «выпуск» в `review`:
  - из `learning`: `interval = easyIntervalDays`;
  - из `relearning`: `interval = max(minimumIntervalDays, intervalДоПровала)`,
    `ease += 0.15`.

При выпуске из `new`/`learning` ease берётся как `startingEase` (если ещё не задан).

### REVIEW (интервалы в днях, по SM-2)

`lateDays = max(0, дней(now - due))` — бонус за просрочку.

- **Again (1)** — провал: `lapses += 1`, `ease = max(easeMinimum, ease − 0.20)`,
  состояние → `relearning`, `step = 0`, `due = now + relearningSteps[0]`.
  Интервал после переучивания:
  `interval = max(minimumIntervalDays, round(interval × lapseIntervalMultiplier))`.
- **Hard (2)** — `ease = max(easeMinimum, ease − 0.15)`,
  `interval = clamp(round(interval × hardIntervalFactor × intervalModifier))`.
- **Good (3)** — `interval = clamp(round((interval + lateDays/2) × ease × intervalModifier))`.
- **Easy (4)** — `ease += 0.15`,
  `interval = clamp(round((interval + lateDays) × ease × easyBonus × intervalModifier))`.

Где `clamp(x) = min(max(x, minimumIntervalDays), maximumIntervalDays)`.
Для Good/Easy дополнительно гарантируется рост: `interval ≥ prevInterval + 1`.

> Размытие интервала (fuzz, ±5 %) вынесено отдельным шагом и **отключено в ядре**
> (передаётся опциональный генератор), чтобы тесты были детерминированы.

## Предпросмотр интервалов

`previewIntervals(state, ctx)` прогоняет `schedule()` для всех четырёх оценок
без сохранения и возвращает для каждой кнопки человекочитаемую метку
(`1 мин`, `10 мин`, `1 д`, `4 д`, `2,3 мес`). UI показывает их на кнопках.

## Журнал повторений (`review_logs`)

Каждое повторение фиксирует: `rating`, `state_before/after`,
`interval_before/after`, `ease_before/after`, `elapsed_days`, `time_taken_ms`,
`reviewed_at`. На этих данных строится статистика удержания (retention),
прогноз нагрузки и распределение ease.

## Ссылки

- SuperMemo SM-2: https://super-memory.com/english/ol/sm2.htm
- Anki SchedV2 (обзор): https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html
