import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const dialCodes = [
  ['🇬🇧', '+44', 'United Kingdom'],
  ['🇺🇬', '+256', 'Uganda'],
  ['🇷🇼', '+250', 'Rwanda'],
  ['🇰🇪', '+254', 'Kenya'],
  ['🇹🇿', '+255', 'Tanzania'],
  ['🇧🇮', '+257', 'Burundi'],
  ['🇨🇩', '+243', 'DR Congo'],
  ['🇸🇸', '+211', 'South Sudan'],
  ['🇺🇸', '+1', 'United States'],
  ['🇨🇦', '+1', 'Canada'],
  ['🇿🇦', '+27', 'South Africa'],
  ['🇳🇬', '+234', 'Nigeria'],
  ['🇬🇭', '+233', 'Ghana'],
  ['🇿🇲', '+260', 'Zambia'],
  ['🇿🇼', '+263', 'Zimbabwe'],
  ['🇲🇼', '+265', 'Malawi'],
  ['🇧🇼', '+267', 'Botswana'],
  ['🇳🇦', '+264', 'Namibia'],
  ['🇲🇿', '+258', 'Mozambique'],
  ['🇪🇹', '+251', 'Ethiopia'],
  ['🇪🇬', '+20', 'Egypt'],
  ['🇮🇪', '+353', 'Ireland'],
  ['🇫🇷', '+33', 'France'],
  ['🇩🇪', '+49', 'Germany'],
  ['🇳🇱', '+31', 'Netherlands'],
  ['🇧🇪', '+32', 'Belgium'],
  ['🇨🇭', '+41', 'Switzerland'],
  ['🇦🇹', '+43', 'Austria'],
  ['🇸🇪', '+46', 'Sweden'],
  ['🇳🇴', '+47', 'Norway'],
  ['🇩🇰', '+45', 'Denmark'],
  ['🇪🇸', '+34', 'Spain'],
  ['🇮🇹', '+39', 'Italy'],
  ['🇵🇹', '+351', 'Portugal'],
  ['🇦🇪', '+971', 'UAE'],
  ['🇶🇦', '+974', 'Qatar'],
  ['🇮🇳', '+91', 'India'],
  ['🇨🇳', '+86', 'China'],
  ['🇦🇺', '+61', 'Australia'],
  ['🇳🇿', '+64', 'New Zealand'],
] as const

const input =
  'w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black'
const label = 'mb-1 block text-[11px] uppercase tracking-[0.15em] text-neutral-500'

export default function Rsvp() {
  const [params] = useSearchParams()
  const initial = params.get('attending') === 'no' ? 'no' : params.get('attending') === 'yes' ? 'yes' : ''
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dialCode, setDialCode] = useState('+44')
  const [phone, setPhone] = useState('')
  const [isChild, setIsChild] = useState(false)
  const [attending, setAttending] = useState(initial)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/guest-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, dialCode, isChild, attending, note }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
    } catch {
      setError('Could not send your RSVP. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8e6e0] px-4 py-12">
      <div className="w-full max-w-2xl rounded-md bg-white p-8 shadow-xl sm:p-12">
        {done ? (
          <div className="text-center">
            <p className="font-serif text-2xl">
              Thank you, {name}! Your RSVP has been sent to Helen and Ian.
            </p>
            <Link to="/" className="mt-6 inline-block text-sm underline underline-offset-4">
              Back to the invitation
            </Link>
          </div>
        ) : (
          <>
            <h1 className="border-b border-neutral-200 pb-4 text-[17px] font-semibold">
              Enter your details to send to Helen and Ian
            </h1>
            <div className="mt-6 border border-neutral-300 bg-[#fbf8f2] px-4 py-3 text-sm text-neutral-700">
              <span className="font-semibold">Invite only wedding</span> — This celebration is by
              invitation only. Please enter the details of the invited guest exactly as they appear
              on your invitation. One entry per guest.
            </div>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="name" className={label}>
                  Name
                </label>
                <input
                  id="name"
                  className={input}
                  placeholder="John Smith"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className={label}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className={input}
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone" className={label}>
                  Phone number
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country dial code"
                    className={`${input} w-32 shrink-0`}
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                  >
                    {dialCodes.map(([flag, code, country]) => (
                      <option key={`${code}-${country}`} value={code}>
                        {flag} {code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    className={input}
                    placeholder="7700 000000"
                    maxLength={40}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isChild}
                  onChange={(e) => setIsChild(e.target.checked)}
                />
                This person is a child
              </label>
              <fieldset>
                <legend className={label}>Will you attend?</legend>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="attending"
                      required
                      checked={attending === 'yes'}
                      onChange={() => setAttending('yes')}
                    />
                    Yes, I will attend
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="attending"
                      required
                      checked={attending === 'no'}
                      onChange={() => setAttending('no')}
                    />
                    No, I will not attend
                  </label>
                </div>
              </fieldset>
              <div>
                <label htmlFor="note" className={label}>
                  Message for the couple <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  id="note"
                  className={`${input} min-h-24`}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-black px-10 py-3 text-[11px] uppercase tracking-[0.2em] text-white disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Done'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
