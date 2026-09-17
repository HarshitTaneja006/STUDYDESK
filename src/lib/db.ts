import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const logOption =
    process.env.NODE_ENV === 'development' ? (['error', 'warn'] as const) : (['error'] as const)

  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN?.trim()

  // Hosted Turso (libSQL) — preferred when env vars are set.
  // Both URL and auth token are required; otherwise fall back to local SQLite
  // so the app still runs offline / before `turso db tokens create` is pasted.
  if (tursoUrl && tursoUrl.startsWith('libsql://') && tursoAuthToken) {
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
    return new PrismaClient({
      adapter,
      log: [...logOption],
    })
  }

  // Local fallback: plain SQLite file (Prisma native driver).
  // Used for offline dev when TURSO_* vars are absent.
  return new PrismaClient({
    log: [...logOption],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
