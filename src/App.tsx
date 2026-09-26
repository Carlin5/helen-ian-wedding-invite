import { Route, Routes } from 'react-router-dom'
import Invite from './pages/Invite'
import Rsvp from './pages/Rsvp'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Invite />} />
      <Route path="/rsvp" element={<Rsvp />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
