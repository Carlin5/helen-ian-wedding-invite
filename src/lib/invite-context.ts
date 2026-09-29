import { createContext, useContext } from 'react'

export const InviteContext = createContext<{ label: string }>({ label: '' })

export const useInvite = () => useContext(InviteContext)
