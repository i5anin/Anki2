import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { CardsModule } from './cards/cards.module'
import { DecksModule } from './decks/decks.module'
import { NotesModule } from './notes/notes.module'
import { NoteTypesModule } from './note-types/note-types.module'
import { QuizModule } from './quiz/quiz.module'
import { StatsModule } from './stats/stats.module'
import { StoreModule } from './store/store.module'
import { StudyModule } from './study/study.module'
import { TrainersModule } from './trainers/trainers.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StoreModule,
    DecksModule,
    NoteTypesModule,
    NotesModule,
    CardsModule,
    StudyModule,
    StatsModule,
    TrainersModule,
    QuizModule,
  ],
})
export class AppModule {}
