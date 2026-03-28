import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import AccountPage from './pages/AccountPage'
import SettingsPage from './pages/SettingsPage'
import './index.css'

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/home"      element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account"   element={<AccountPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App