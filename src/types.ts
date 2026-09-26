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
}
