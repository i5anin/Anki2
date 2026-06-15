import { Injectable, NotFoundException } from '@nestjs/common'

import type { Card, RenderedCard } from '../domain/card.entity'
import type { DeckCounts } from '../domain/deck.entity'
import type { IntervalPreview, SchedulingState } from '../srs'
import type { ReviewDto } from './dto/review.dto'

import { toRenderedCard } from '../rendering'
import { previewIntervals, schedule } from '../srs'
import { DataStore } from '../store/data-store'
import { countDeck, selectQueue } from './queue'

/** Шапка очереди: краткие данные колоды. */
export interface QueueDeck {
  id: string
  name: string
}

/** Учебная очередь колоды: шапка, счётчики и отрисованные карточки. */
export interface QueueResult {
  deck: QueueDeck
  counts: DeckCounts
  cards: RenderedCard[]
}

/** Предпросмотр интервалов по всем кнопкам оценки. */
export interface PreviewResult {
  previews: IntervalPreview[]
}

/** Результат оценки: обновлённая карточка. */
export interface ReviewResult {
  card: Card
}

@Injectable()
export class StudyService {
  constructor(private readonly store: DataStore) {}

  /** Переводит карточку в состояние планировщика (строковые даты → Date). */
  private toSchedulingState(card: Card): SchedulingState {
    return {
      state: card.state,
      intervalDays: card.intervalDays,
      easeFactor: card.easeFactor,
      reps: card.reps,
      lapses: card.lapses,
      learningStep: card.learningStep,
      due: new Date(card.due),
      lastReviewedAt: card.lastReviewedAt ? new Date(card.lastReviewedAt) : null,
    }
  }

  /** Начало сегодняшних суток в ISO — граница для дневных счётчиков. */
  private startOfTodayIso(now: Date): string {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }

  async queue(deckId: string): Promise<QueueResult> {
    const deck = await this.store.getDeck(deckId)
    if (!deck) throw new NotFoundException('Колода не найдена')

    const now = new Date()
    const cards = await this.store.listCards({ deckId, includeSuspended: false })
    const logsToday = await this.store.listReviewLogs({
      deckId,
      since: this.startOfTodayIso(now),
    })

    const picked = selectQueue(cards, logsToday, deck.config, now)

    const notes = await this.store.listNotes(deckId)
    const noteTypes = await this.store.listNoteTypes()
    const notesById = new Map(notes.map((note) => [note.id, note]))
    const noteTypesById = new Map(noteTypes.map((noteType) => [noteType.id, noteType]))

    const rendered = picked.flatMap((card) => {
      const note = notesById.get(card.noteId)
      if (!note) return []
      const noteType = noteTypesById.get(note.noteTypeId)
      if (!noteType) return []
      return [toRenderedCard(card, note, noteType)]
    })

    return {
      deck: { id: deck.id, name: deck.name },
      counts: countDeck(cards, logsToday, deck.config, now),
      cards: rendered,
    }
  }

  async preview(deckId: string, cardId: string): Promise<PreviewResult> {
    const card = await this.store.getCard(cardId)
    if (!card) throw new NotFoundException('Карточка не найдена')

    const deck = await this.store.getDeck(card.deckId)
    if (!deck) throw new NotFoundException('Колода не найдена')

    const now = new Date()
    return {
      previews: previewIntervals(this.toSchedulingState(card), { now, config: deck.config }),
    }
  }

  async review(dto: ReviewDto): Promise<ReviewResult> {
    const card = await this.store.getCard(dto.cardId)
    if (!card) throw new NotFoundException('Карточка не найдена')

    const deck = await this.store.getDeck(card.deckId)
    if (!deck) throw new NotFoundException('Колода не найдена')

    const now = new Date()
    const { next, log } = schedule(this.toSchedulingState(card), dto.rating, {
      now,
      config: deck.config,
    })

    const updated = await this.store.updateCard(card.id, {
      state: next.state,
      due: next.due.toISOString(),
      intervalDays: next.intervalDays,
      easeFactor: next.easeFactor,
      reps: next.reps,
      lapses: next.lapses,
      learningStep: next.learningStep,
      lastReviewedAt: now.toISOString(),
    })
    if (!updated) throw new NotFoundException('Карточка не найдена')

    await this.store.createReviewLog({
      cardId: card.id,
      rating: dto.rating,
      stateBefore: log.stateBefore,
      stateAfter: log.stateAfter,
      intervalBefore: log.intervalBefore,
      intervalAfter: log.intervalAfter,
      easeBefore: log.easeBefore,
      easeAfter: log.easeAfter,
      elapsedDays: log.elapsedDays,
      timeTakenMs: dto.timeTakenMs ?? 0,
    })

    return { card: updated }
  }
}
