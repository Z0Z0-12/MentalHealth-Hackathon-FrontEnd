import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import AccountPage from './pages/AccountPage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboard from './pages/AdminDashboard'
function App() {
  return (
    <UserProvider>å
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/home"      element={<LandingPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account"   element={<AccountPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
          <Route path="/dashboard/admin" element ={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App