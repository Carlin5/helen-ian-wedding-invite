import { randomBytes, randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken } from '../_lib/auth.js'
import { deleteInvite, getInvite, listInvites, saveInvite } from '../_lib/store.js'
import type { Invite } from '../../src/types.js'

const cors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (!process.env.ADMIN_SECRET && !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin access is not configured' })
  }
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ invites: await listInvites() })
    }

    if (req.method === 'POST') {
      const { label } = (req.body ?? {}) as { label?: unknown }
      const name = typeof label === 'string' ? label.trim() : ''
      if (!name) return res.status(400).json({ error: 'Label is required' })
      if (name.length > 120) return res.status(400).json({ error: 'Label must be 120 characters or fewer' })
      const invite: Invite = {
        id: randomUUID(),
        code: randomBytes(15).toString('base64url'),
        label: name,
        createdAt: new Date().toISOString(),
        claimedAt: null,
        deviceId: null,
        revokedAt: null,
        resets: 0,
      }
      await saveInvite(invite)
      return res.status(200).json({ invite })
    }

    if (req.method === 'PATCH') {
      const { id, action } = (req.body ?? {}) as { id?: unknown; action?: unknown }
      const invite = typeof id === 'string' ? await getInvite(id) : null
      if (!invite) return res.status(404).json({ error: 'Invite not found' })
      if (action === 'reset') {
        invite.claimedAt = null
        invite.deviceId = null
        invite.resets += 1
      } else if (action === 'revoke') {
        invite.revokedAt = new Date().toISOString()
      } else if (action === 'unrevoke') {
        invite.revokedAt = null
      } else {
        return res.status(400).json({ error: 'Unknown action' })
      }
      await saveInvite(invite)
      return res.status(200).json({ invite })
    }

    if (req.method === 'DELETE') {
      const { id } = (req.body ?? {}) as { id?: unknown }
      if (typeof id !== 'string' || !id) return res.status(400).json({ error: 'Missing id' })
      await deleteInvite(id)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Could not process invites' })
  }
}
