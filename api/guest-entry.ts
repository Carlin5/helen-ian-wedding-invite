import { randomUUID } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { saveGuest } from './_lib/store.js'
import type { GuestEntry } from '../src/types.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dialCodePattern = /^\+\d{1,4}$/

const cors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = (req.body ?? {}) as Record<string, unknown>

    const name = text(body.name)
    if (!name) return res.status(400).json({ error: 'Please enter the guest name.' })
    if (name.length > 120) return res.status(400).json({ error: 'Name must be 120 characters or fewer.' })

    const email = text(body.email)
    if (email.length > 254) {
      return res.status(400).json({ error: 'Email must be 254 characters or fewer.' })
    }
    if (email && !emailPattern.test(email)) {
      return res.status(400).json({ error: 'Please check the email address.' })
    }

    const phone = text(body.phone)
    if (phone.length > 40) return res.status(400).json({ error: 'Phone number must be 40 characters or fewer.' })

    const dialCode = text(body.dialCode)
    if (dialCode.length > 8 || (dialCode && !dialCodePattern.test(dialCode))) {
      return res.status(400).json({ error: 'Please check the country dial code.' })
    }

    const attending = text(body.attending)
    if (attending !== 'yes' && attending !== 'no') {
      return res.status(400).json({ error: 'Please choose whether you will attend.' })
    }

    const note = text(body.note)
    if (note.length > 1000) return res.status(400).json({ error: 'Your message must be 1000 characters or fewer.' })

    const countryHeader = req.headers['x-vercel-ip-country']
    const record: GuestEntry = {
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
      name,
      email,
      phone,
      dialCode,
      isChild: Boolean(body.isChild),
      attending,
      note,
      country: typeof countryHeader === 'string' ? countryHeader : '',
    }

    await saveGuest(record)
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Could not save your details' })
  }
}
