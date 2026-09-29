import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { del, get, list, put } from '@vercel/blob'
import type { GuestEntry, Invite } from '../../src/types.js'

const GUESTS_PREFIX = 'guests/'
const INVITES_PREFIX = 'invites/'
const guestsFile = join(process.cwd(), 'data', 'guests.json')
const invitesFile = join(process.cwd(), 'data', 'invites.json')

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

async function readLocal<T>(file: string): Promise<T[]> {
  try {
    const raw = await readFile(file, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

async function writeLocal<T>(file: string, entries: T[]) {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(`${file}.tmp`, JSON.stringify(entries, null, 2))
  await rename(`${file}.tmp`, file)
}

const bySubmittedAtDesc = <T extends { submittedAt: string }>(a: T, b: T) =>
  new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()

const byCreatedAtDesc = <T extends { createdAt: string }>(a: T, b: T) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

export async function saveGuest(record: GuestEntry): Promise<void> {
  assertConfigured()
  if (remote()) {
    await put(`${GUESTS_PREFIX}${Date.now()}-${record.id}.json`, JSON.stringify(record), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: true,
    })
    return
  }
  await withLock(async () => {
    const entries = await readLocal<GuestEntry>(guestsFile)
    entries.unshift(record)
    await writeLocal(guestsFile, entries)
  })
}

export async function listGuests(): Promise<GuestEntry[]> {
  assertConfigured()
  if (remote()) {
    const guests: GuestEntry[] = []
    let cursor: string | undefined
    do {
      const result = await list({ prefix: GUESTS_PREFIX, ...(cursor ? { cursor } : {}) })
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
    guests.sort(bySubmittedAtDesc)
    return guests
  }
  return readLocal<GuestEntry>(guestsFile)
}

const inviteCodePattern = /^[A-Za-z0-9_-]{8,64}$/

export async function getInvite(code: string): Promise<Invite | null> {
  assertConfigured()
  if (!inviteCodePattern.test(code)) return null
  if (remote()) {
    try {
      const response = await get(`${INVITES_PREFIX}${code}.json`, {
        access: 'private',
        useCache: false,
      })
      if (!response) return null
      const text = await new Response(response.stream).text()
      return JSON.parse(text) as Invite
    } catch {
      return null
    }
  }
  const invites = await readLocal<Invite>(invitesFile)
  return invites.find((invite) => invite.code === code) ?? null
}

export async function listInvites(): Promise<Invite[]> {
  assertConfigured()
  if (remote()) {
    const invites: Invite[] = []
    let cursor: string | undefined
    do {
      const result = await list({ prefix: INVITES_PREFIX, ...(cursor ? { cursor } : {}) })
      for (const blob of result.blobs) {
        try {
          const response = await get(blob.pathname, { access: 'private', useCache: false })
          if (!response) continue
          const text = await new Response(response.stream).text()
          invites.push(JSON.parse(text) as Invite)
        } catch (error) {
          console.warn(`Skipping unreadable invite ${blob.pathname}`, error)
        }
      }
      cursor = result.hasMore ? result.cursor : undefined
    } while (cursor)
    invites.sort(byCreatedAtDesc)
    return invites
  }
  const invites = await readLocal<Invite>(invitesFile)
  invites.sort(byCreatedAtDesc)
  return invites
}

export async function saveInvite(invite: Invite): Promise<void> {
  assertConfigured()
  if (remote()) {
    await put(`${INVITES_PREFIX}${invite.code}.json`, JSON.stringify(invite), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return
  }
  await withLock(async () => {
    const invites = await readLocal<Invite>(invitesFile)
    const index = invites.findIndex((entry) => entry.code === invite.code)
    if (index === -1) invites.unshift(invite)
    else invites[index] = invite
    await writeLocal(invitesFile, invites)
  })
}

export async function deleteInvite(code: string): Promise<void> {
  assertConfigured()
  if (remote()) {
    await del(`${INVITES_PREFIX}${code}.json`)
    return
  }
  await withLock(async () => {
    const invites = await readLocal<Invite>(invitesFile)
    await writeLocal(
      invitesFile,
      invites.filter((invite) => invite.code !== code),
    )
  })
}
