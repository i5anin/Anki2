const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

interface BannerInfo {
  url: string
  docs: string
  supabaseUrl: string
  usingSupabase: boolean
}

const ENDPOINTS = [
  { verb: 'GET', color: C.green, path: '/api/decks', desc: 'колоды со счётчиками' },
  { verb: 'GET', color: C.green, path: '/api/study/:id/queue', desc: 'очередь повторения' },
  { verb: 'POST', color: C.yellow, path: '/api/study/review', desc: 'оценить карточку' },
  { verb: 'POST', color: C.yellow, path: '/api/notes', desc: 'создать заметку' },
  { verb: 'GET', color: C.green, path: '/api/stats/overview', desc: 'статистика' },
]

/** Печатает аккуратный цветной баннер при запуске сервера. */
export function printBanner(info: BannerInfo): void {
  const rule = `  ${C.gray}${'─'.repeat(56)}${C.reset}`
  const lines: string[] = ['']

  lines.push(`  ${C.bold}${C.magenta}◆  ANKI2${C.reset}  ${C.dim}·  REST API (NestJS + Supabase)${C.reset}`)
  lines.push(rule)
  lines.push(`  ${C.cyan}▸ API${C.reset}        ${C.bold}${info.url}${C.reset}`)
  lines.push(`  ${C.cyan}▸ Swagger${C.reset}    ${C.bold}${info.docs}${C.reset}`)
  if (info.usingSupabase) {
    lines.push(`  ${C.cyan}▸ Хранилище${C.reset}  ${C.green}Supabase${C.reset} ${C.dim}${info.supabaseUrl}${C.reset}`)
  } else {
    lines.push(
      `  ${C.cyan}▸ Хранилище${C.reset}  ${C.yellow}in-memory (демо)${C.reset} ${C.dim}— задайте SUPABASE_SERVICE_ROLE_KEY${C.reset}`,
    )
  }
  lines.push(rule)
  for (const e of ENDPOINTS) {
    const verb = `${e.color}${C.bold}${e.verb.padEnd(6)}${C.reset}`
    lines.push(`    ${verb}${C.bold}${e.path.padEnd(22)}${C.reset}${C.gray}— ${e.desc}${C.reset}`)
  }
  lines.push(rule)
  lines.push(`  ${C.dim}Остановить:${C.reset} ${C.bold}CTRL+C${C.reset}`)
  lines.push('')

  console.log(lines.join('\n'))
}
