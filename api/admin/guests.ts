import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken } from '../_lib/auth.js'
import { listGuests } from '../_lib/store.js'

const cors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!process.env.ADMIN_SECRET && !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin access is not configured' })
  }
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const guests = await listGuests()
    const attending = guests.filter((g) => g.attending === 'yes').length
    const children = guests.filter((g) => g.isChild).length
    return res.status(200).json({
      guests,
      totals: {
        entries: guests.length,
        attending,
        notAttending: guests.length - attending,
        adults: guests.length - children,
        children,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Could not load guests' })
  }
}
