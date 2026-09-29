export type GuestEntry = {
  id: string
  submittedAt: string
  name: string
  email: string
  phone: string
  dialCode: string
  isChild: boolean
  attending: 'yes' | 'no'
  note: string
  country: string
  inviteLabel?: string
}

export type Invite = {
  id: string
  code: string
  label: string
  createdAt: string
  claimedAt: string | null
  deviceId: string | null
  revokedAt: string | null
  resets: number
}
