import { timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getInviteByCode, saveInvite } from '../_lib/store.js'

const deviceIdPattern = /^[A-Za-z0-9-]{8,64}$/

const cors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const sameDevice = (a: string, b: string) => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = (req.body ?? {}) as { code?: unknown; deviceId?: unknown }
    const code = typeof body.code === 'string' ? body.code : ''
    const deviceId = typeof body.deviceId === 'string' ? body.deviceId : ''
    if (!code || code.length > 64 || !deviceIdPattern.test(deviceId)) {
      return res.status(400).json({ error: 'invalid' })
    }

    const invite = await getInviteByCode(code)
    if (!invite || invite.revokedAt) return res.status(404).json({ error: 'invalid' })

    if (!invite.claimedAt) {
      invite.claimedAt = new Date().toISOString()
      invite.deviceId = deviceId
      await saveInvite(invite)
      return res.status(200).json({ ok: true, label: invite.label })
    }

    if (invite.deviceId && sameDevice(invite.deviceId, deviceId)) {
      return res.status(200).json({ ok: true, label: invite.label })
    }

    return res.status(403).json({ error: 'used' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'error' })
  }
}
