import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { GuestEntry, Invite } from '../types'

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
  const [invites, setInvites] = useState<Invite[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [inviteBusy, setInviteBusy] = useState(false)
  const [copiedId, setCopiedId] = useState('')

  const loadInvites = async (t: string) => {
    try {
      const res = await fetch('/api/admin/invites', {
        headers: { Authorization: `Bearer ${t}` },
      })
      const data = (await res.json().catch(() => ({}))) as { invites?: Invite[] }
      if (res.ok) setInvites(data.invites || [])
    } catch {
      // invite list is best-effort; errors surface on mutations
    }
  }

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
      void loadInvites(t)
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

  const createInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim()) return
    setInviteBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ label: newLabel.trim() }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error || 'Could not create invite')
        return
      }
      setNewLabel('')
      void loadInvites(token)
    } finally {
      setInviteBusy(false)
    }
  }

  const patchInvite = async (id: string, action: 'reset' | 'revoke' | 'unrevoke') => {
    const res = await fetch('/api/admin/invites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action }),
    })
    if (!res.ok) {
      setError('Could not update invite')
      return
    }
    void loadInvites(token)
  }

  const removeInvite = async (id: string) => {
    if (!confirm('Delete this invite link?')) return
    const res = await fetch('/api/admin/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      setError('Could not delete invite')
      return
    }
    void loadInvites(token)
  }

  const copyLink = (invite: Invite) => {
    const url = `${location.origin}/i/${invite.code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(invite.id)
      setTimeout(() => setCopiedId(''), 1500)
    })
  }

  const inviteStatus = (invite: Invite) => {
    const base = invite.revokedAt
      ? 'Revoked'
      : invite.claimedAt
        ? `Opened ${new Date(invite.claimedAt).toLocaleDateString()}`
        : 'Not opened yet'
    return invite.resets > 0 ? `${base} · reset ×${invite.resets}` : base
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

        <section className="mt-8 border border-neutral-200 bg-white p-6">
          <h2 className="font-serif text-xl">Invite links</h2>
          <form onSubmit={createInvite} className="mt-4 flex flex-wrap gap-2">
            <input
              className={`${input} max-w-sm flex-1`}
              placeholder="Guest / household name"
              value={newLabel}
              maxLength={120}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <button type="submit" className={outlineBtn} disabled={inviteBusy}>
              Create link
            </button>
          </form>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  {['Name', 'Link', 'Status', 'Actions'].map((h) => (
                    <th key={h} className={`${label} px-4 py-3 font-medium`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">{invite.label}</td>
                    <td className="px-4 py-3">
                      <span className="mr-2 inline-block max-w-56 truncate align-middle text-neutral-500">
                        {`${location.origin}/i/${invite.code}`}
                      </span>
                      <button
                        className="text-[11px] uppercase tracking-[0.1em] underline"
                        onClick={() => copyLink(invite)}
                      >
                        {copiedId === invite.id ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{inviteStatus(invite)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {invite.claimedAt && (
                        <button
                          className="mr-3 text-[11px] uppercase tracking-[0.1em] underline"
                          onClick={() => void patchInvite(invite.id, 'reset')}
                        >
                          Reset
                        </button>
                      )}
                      {invite.revokedAt ? (
                        <button
                          className="mr-3 text-[11px] uppercase tracking-[0.1em] underline"
                          onClick={() => void patchInvite(invite.id, 'unrevoke')}
                        >
                          Unrevoke
                        </button>
                      ) : (
                        <button
                          className="mr-3 text-[11px] uppercase tracking-[0.1em] underline"
                          onClick={() => void patchInvite(invite.id, 'revoke')}
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        className="text-[11px] uppercase tracking-[0.1em] text-red-700 underline"
                        onClick={() => void removeInvite(invite.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!invites.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                      No invite links yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

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
                {['Submitted', 'Name', 'Email', 'Phone', 'Child', 'Attending', 'Message', 'Country', 'Invite'].map(
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
                  <td className="px-4 py-3">{g.inviteLabel ?? ''}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-neutral-400">
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
