import { Global, Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { DataStore } from './data-store'
import { MemoryDataStore } from './memory.store'
import { SupabaseService } from './supabase.service'
import { SupabaseDataStore } from './supabase.store'

/**
 * Глобальный модуль данных. Если задан SUPABASE_SERVICE_ROLE_KEY — работаем
 * с боевым Supabase; иначе поднимается офлайн-режим (MemoryDataStore) с демо-данными.
 */
@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: DataStore,
      inject: [ConfigService, SupabaseService],
      useFactory: (config: ConfigService, supabase: SupabaseService): DataStore => {
        const logger = new Logger('StoreModule')
        const configured = Boolean(config.get<string>('SUPABASE_SERVICE_ROLE_KEY'))
        if (configured) {
          logger.log('Хранилище: Supabase')
          return new SupabaseDataStore(supabase)
        }
        logger.warn('Хранилище: in-memory (демо) — задайте SUPABASE_SERVICE_ROLE_KEY для Supabase')
        return new MemoryDataStore()
      },
    },
  ],
  exports: [DataStore],
})
export class StoreModule {}
