import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { GuestEntry } from '../types'

const TOKEN_KEY = 'helen-ian-admin-token'

type Totals = {
  entries: number
  attending: number
  notAttending: number
  adults: number
  children: number
}

const label = 'text-[11px] uppercase tracking-[0.15em] text-neutral-500'
const input =
  'border border-neutral-300 bg-white px-4 py-2 text-sm outline-none focus:border-black'
const outlineBtn =
  'border border-black px-4 py-2 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors disabled:opacity-50'

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [guests, setGuests] = useState<GuestEntry[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (t: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/guests', {
        headers: { Authorization: `Bearer ${t}` },
      })
      const data = (await res.json().catch(() => ({}))) as {
        guests?: GuestEntry[]
        totals?: Totals
        error?: string
      }
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken('')
        return
      }
      if (!res.ok) {
        setError(data.error || 'Could not load guests')
        return
      }
      setGuests(data.guests || [])
      setTotals(data.totals || null)
    } catch {
      setError('Could not load guests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      if (token) void load(token)
    }, 0)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string }
      if (!res.ok || !data.token) {
        setError(data.error || 'Login failed')
        return
      }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      void load(data.token)
    } catch {
      setError('Login failed')
    }
  }

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setGuests([])
    setTotals(null)
  }

  const exportCsv = async () => {
    const res = await fetch('/api/admin/export', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      setError('Could not export guests')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guests.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <form onSubmit={login} className="w-full max-w-sm border border-neutral-200 bg-white p-8">
          <h1 className="font-serif text-2xl">Admin</h1>
          <label htmlFor="password" className={`${label} mt-6 block`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`${input} mt-1 w-full`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button type="submit" className={`${outlineBtn} mt-6 w-full`}>
            Sign in
          </button>
          <Link to="/" className="mt-4 block text-center text-xs text-neutral-400 underline">
            Back to invitation
          </Link>
        </form>
      </div>
    )
  }

  const query = search.trim().toLowerCase()
  const filtered = query
    ? guests.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.email.toLowerCase().includes(query) ||
          g.phone.toLowerCase().includes(query) ||
          g.country.toLowerCase().includes(query),
      )
    : guests

  const cards: [string, number][] = totals
    ? [
        ['Entries', totals.entries],
        ['Attending', totals.attending],
        ['Not attending', totals.notAttending],
        ['Adults', totals.adults],
        ['Children', totals.children],
      ]
    : []

  return (
    <div className="min-h-screen bg-cream px-4 py-10 text-ink">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <h1 className="font-serif text-3xl">Guest list</h1>
          <div className="flex gap-2">
            <button className={outlineBtn} onClick={exportCsv}>
              Export CSV
            </button>
            <button className={outlineBtn} onClick={() => void load(token)} disabled={loading}>
              Refresh
            </button>
            <button className={outlineBtn} onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {cards.map(([name, value]) => (
            <div key={name} className="border border-neutral-200 bg-white p-4 text-center">
              <p className="font-serif text-3xl">{value}</p>
              <p className={`${label} mt-1`}>{name}</p>
            </div>
          ))}
        </div>

        <input
          className={`${input} mt-6 w-full max-w-sm`}
          placeholder="Search guests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="mt-4 overflow-x-auto border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                {['Submitted', 'Name', 'Email', 'Phone', 'Child', 'Attending', 'Message', 'Country'].map(
                  (h) => (
                    <th key={h} className={`${label} px-4 py-3 font-medium`}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(g.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{g.name}</td>
                  <td className="px-4 py-3">{g.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {g.dialCode} {g.phone}
                  </td>
                  <td className="px-4 py-3">{g.isChild ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{g.attending === 'yes' ? 'Yes' : 'No'}</td>
                  <td className="max-w-48 truncate px-4 py-3" title={g.note}>
                    {g.note}
                  </td>
                  <td className="px-4 py-3">{g.country}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                    {loading ? 'Loading…' : 'No entries yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
