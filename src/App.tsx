import { Route, Routes } from 'react-router-dom'
import Invite from './pages/Invite'
import Rsvp from './pages/Rsvp'
import Admin from './pages/Admin'
import InviteLink from './pages/InviteLink'
import RequireInvite from './components/RequireInvite'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireInvite>
            <Invite />
          </RequireInvite>
        }
      />
      <Route
        path="/rsvp"
        element={
          <RequireInvite>
            <Rsvp />
          </RequireInvite>
        }
      />
      <Route path="/i/:code" element={<InviteLink />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
