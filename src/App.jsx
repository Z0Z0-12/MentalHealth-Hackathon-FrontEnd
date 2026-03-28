import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import './index.css'

// ── Public ────────────────────────────────────────────────────────────────────
import LandingPage from './pages/LandingPage'
import GoogleCallback from './pages/GoogleCallback'

// ── Student (existing pages) ──────────────────────────────────────────────────
import Dashboard from './pages/Dashboard'
import AccountPage from './pages/AccountPage'
import SettingsPage from './pages/SettingsPage'

// ── University ────────────────────────────────────────────────────────────────
import UniversityDashboard from './pages/UniversityDashboard'

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard from './pages/AdminDashboard'

// Sends logged-in users straight to their dashboard
function RootRedirect() {
  const { isAuthenticated, dashboardPath, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to={dashboardPath()} replace />
  return <LandingPage />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"      element={<RootRedirect />} />
      <Route path="/home"  element={<RootRedirect />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Student */}
      <Route element={<ProtectedRoute roles={['student']} />}>
        <Route path="/dashboard/student" element={<Dashboard />} />
        <Route path="/account"           element={<AccountPage />} />
        <Route path="/settings"          element={<SettingsPage />} />
      </Route>

      {/* University */}
      <Route element={<ProtectedRoute roles={['university']} />}>
        <Route path="/dashboard/university" element={<UniversityDashboard />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}