import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import InvalidInvite from './InvalidInvite'
import { getCode, verify } from '../lib/invite'
import { InviteContext } from '../lib/invite-context'

type State = 'pending' | 'ok' | 'invalid' | 'used'

export default function RequireInvite({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => (getCode() ? 'pending' : 'invalid'))
  const [label, setLabel] = useState('')

  useEffect(() => {
    const code = getCode()
    if (!code) return
    let cancelled = false
    verify(code).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setLabel(result.label)
        setState('ok')
      } else {
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
