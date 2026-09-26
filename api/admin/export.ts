import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyToken } from '../_lib/auth.js'
import { listGuests } from '../_lib/store.js'

function csvCell(value: string | boolean) {
  let text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!process.env.ADMIN_SECRET && !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Admin access is not configured' })
  }
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const guests = await listGuests()
    const header = 'Submitted,Name,Email,Phone,Dial Code,Child,Attending,Message,Country'
    const rows = guests.map((g) =>
      [
        g.submittedAt,
        g.name,
        g.email,
        g.phone,
        g.dialCode,
        g.isChild ? 'yes' : 'no',
        g.attending,
        g.note,
        g.country,
      ]
        .map(csvCell)
        .join(','),
    )
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"')
    return res.status(200).send([header, ...rows].join('\n'))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Could not export guests' })
  }
}
