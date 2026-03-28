import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Usage in App.jsx:
//   <Route element={<ProtectedRoute />}>                        ← any logged-in user
//   <Route element={<ProtectedRoute roles={['student']} />}>    ← students only
//   <Route element={<ProtectedRoute roles={['university']} />}> ← universities only
//   <Route element={<ProtectedRoute roles={['admin']} />}>      ← admins only

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth()

  // ── Still validating token on mount — don't flash login page ──────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1rem',
        color: '#888',
      }}>
        Loading...
      </div>
    )
  }

  // ── Not logged in → send to login ─────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ── Logged in but wrong role → send to their own dashboard ───────────────
  if (roles && !roles.includes(user.role)) {
    const fallback = {
      student:    '/dashboard/student',
      university: '/dashboard/university',
      admin:      '/dashboard/admin',
    }[user.role] || '/'

    return <Navigate to={fallback} replace />
  }

  // ── All good — render the child route ────────────────────────────────────
  return <Outlet />
}
