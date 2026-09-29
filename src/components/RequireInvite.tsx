import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import InvalidInvite from './InvalidInvite'
import { getCode, OK_KEY, verify } from '../lib/invite'
import { InviteContext } from '../lib/invite-context'

type State = 'pending' | 'ok' | 'invalid' | 'used'

export default function RequireInvite({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => (getCode() ? 'pending' : 'invalid'))
  const [label, setLabel] = useState('')

  useEffect(() => {
    const code = getCode()
    if (!code) return
    const cached = sessionStorage.getItem(OK_KEY)
    if (cached?.startsWith(`${code}:`)) {
      queueMicrotask(() => {
        setLabel(cached.slice(code.length + 1))
        setState('ok')
      })
      return
    }
    let cancelled = false
    verify(code).then((result) => {
      if (cancelled) return
      if (result.ok) {
        sessionStorage.setItem(OK_KEY, `${code}:${result.label}`)
        setLabel(result.label)
        setState('ok')
      } else {
        sessionStorage.removeItem(OK_KEY)
        setState(result.reason === 'used' ? 'used' : 'invalid')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'pending') return <div className="min-h-screen bg-cream" />
  if (state !== 'ok') return <InvalidInvite reason={state} />
  return <InviteContext.Provider value={{ label }}>{children}</InviteContext.Provider>
}
