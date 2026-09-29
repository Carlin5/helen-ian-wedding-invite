const DEVICE_KEY = 'helen-ian-device'
const CODE_KEY = 'helen-ian-invite-code'
export const OK_KEY = 'helen-ian-invite-ok'

export function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

export function getCode() {
  return localStorage.getItem(CODE_KEY)
}

export function setCode(code: string) {
  localStorage.setItem(CODE_KEY, code)
}

export type VerifyResult =
  | { ok: true; label: string }
  | { ok: false; reason: 'invalid' | 'used' | 'error' }

export async function verify(code: string): Promise<VerifyResult> {
  try {
    const res = await fetch('/api/invite/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId: deviceId() }),
    })
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; label?: string; error?: string }
      | null
    if (res.ok && data?.ok) return { ok: true, label: data.label || '' }
    if (res.status === 403 || data?.error === 'used') return { ok: false, reason: 'used' }
    if (res.status === 404 || res.status === 400 || !data) return { ok: false, reason: 'invalid' }
    return { ok: false, reason: data?.error === 'used' ? 'used' : 'invalid' }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
