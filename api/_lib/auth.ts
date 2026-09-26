import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD
  if (!s) throw new Error('Admin access is not configured')
  return s
}

function signature(expiry: number) {
  return createHmac('sha256', secret()).update(`helen-ian-admin:${expiry}`).digest('base64url')
}

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

export function passwordMatches(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  return timingSafeEqual(digest(password), digest(expected))
}

export function createToken() {
  const expiry = Date.now() + 7 * 86400000
  return `${signature(expiry)}.${expiry}`
}

export function verifyToken(req: VercelRequest) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
  const [provided, expiryText] = token.split('.')
  const expiry = Number(expiryText)
  if (!provided || !Number.isFinite(expiry) || expiry < Date.now()) return false
  const expected = signature(expiry)
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}
