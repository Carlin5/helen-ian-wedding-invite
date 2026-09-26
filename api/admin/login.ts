import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createToken, passwordMatches } from '../_lib/auth.js'

const cors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin access is not configured' })
  }

  const { password } = (req.body ?? {}) as { password?: string }
  if (!password || !passwordMatches(password)) {
    return res.status(401).json({ error: 'Incorrect password' })
  }
  return res.status(200).json({ token: createToken() })
}
