import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { get, list, put } from '@vercel/blob'
import type { GuestEntry } from '../../src/types.js'

const PREFIX = 'guests/'
const localFile = join(process.cwd(), 'data', 'guests.json')

const remote = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const assertConfigured = () => {
  if (!remote() && process.env.VERCEL) {
    throw new Error('Guest storage is not configured (BLOB_READ_WRITE_TOKEN missing)')
  }
}

let queue: Promise<void> = Promise.resolve()
const withLock = <T>(fn: () => Promise<T>) => {
  const run = queue.then(fn)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function readLocal(): Promise<GuestEntry[]> {
  try {
    const raw = await readFile(localFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as GuestEntry[]) : []
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

async function writeLocal(entries: GuestEntry[]) {
  await mkdir(dirname(localFile), { recursive: true })
  await writeFile(`${localFile}.tmp`, JSON.stringify(entries, null, 2))
  await rename(`${localFile}.tmp`, localFile)
}

export async function saveGuest(record: GuestEntry): Promise<void> {
  assertConfigured()
  if (remote()) {
    await put(`${PREFIX}${Date.now()}-${record.id}.json`, JSON.stringify(record), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: true,
    })
    return
  }
  await withLock(async () => {
    const entries = await readLocal()
    entries.unshift(record)
    await writeLocal(entries)
  })
}

export async function listGuests(): Promise<GuestEntry[]> {
  assertConfigured()
  if (remote()) {
    const guests: GuestEntry[] = []
    let cursor: string | undefined
    do {
      const result = await list({ prefix: PREFIX, ...(cursor ? { cursor } : {}) })
      for (const blob of result.blobs) {
        try {
          const response = await get(blob.pathname, { access: 'private' })
          if (!response) continue
          const text = await new Response(response.stream).text()
          guests.push(JSON.parse(text) as GuestEntry)
        } catch (error) {
          console.warn(`Skipping unreadable guest entry ${blob.pathname}`, error)
        }
      }
      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)
    guests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    return guests
  }
  return readLocal()
}
