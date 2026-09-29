import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InvalidInvite from '../components/InvalidInvite'
import { setCode, verify } from '../lib/invite'

type State = 'pending' | 'invalid' | 'used'

export default function InviteLink() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<State>(code ? 'pending' : 'invalid')

  useEffect(() => {
    if (!code) return
    let cancelled = false
    verify(code).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setCode(code)
        navigate('/', { replace: true })
      } else {
        setState(result.reason === 'used' ? 'used' : 'invalid')
      }
    })
    return () => {
      cancelled = true
    }
  }, [code, navigate])

  if (state === 'pending') return <div className="min-h-screen bg-cream" />
  return <InvalidInvite reason={state} />
}
