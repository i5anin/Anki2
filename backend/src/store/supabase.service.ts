import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Клиент с нетипизированной БД (`Database = any` — собственный дефолт supabase-js,
 * при котором запросы остаются «свободными») и произвольной схемой. Иначе клиент
 * без дженериков подставил бы схему `'public'` и не принял бы нашу `anki`.
 * Единственное место с `any`, и оно навязано контрактом библиотеки.
 */
type AnkiSupabaseClient = SupabaseClient<any, string>

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name)
  private instance: AnkiSupabaseClient | null = null

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.get<string>('SUPABASE_URL')
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')
    const schema = this.config.get<string>('SUPABASE_SCHEMA') ?? 'anki'

    if (!url || !key) {
      // Не валим запуск — сервер поднимется и покажет баннер, но запросы к БД вернут 500.
      this.logger.warn(
        'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY не заданы — запросы к БД будут возвращать 500. Заполните backend/.env',
      )
      return
    }

    this.instance = createClient(url, key, {
      db: { schema },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    this.logger.log(`Supabase-клиент инициализирован (схема ${schema})`)
  }

  get client(): AnkiSupabaseClient {
    if (!this.instance) {
      throw new Error(
        'Supabase не настроен: укажите SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в backend/.env',
      )
    }
    return this.instance
  }
}
