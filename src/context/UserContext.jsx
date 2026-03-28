import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'
import { getToken } from '../api/config'

const UserContext = createContext(null)

// Normalize whatever shape the backend returns into what our UI expects
function normalizeUser(raw) {
  if (!raw) return null
  const name =
    raw.name ??
    (raw.first_name || raw.last_name
      ? `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim()
      : raw.email)
  return {
    ...raw,
    name,
    email:  raw.email  ?? null,
    role:   raw.role   ?? (Array.isArray(raw.roles) ? raw.roles[0] : 'Student'),
    joined: raw.joined ?? (raw.created_at ? raw.created_at.split('T')[0] : null),
  }
}

export function UserProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, if a token exists in localStorage try to restore the session
  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    getMe()
      .then(raw => setUser(normalizeUser(raw)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  function login(userData) {
    setUser(normalizeUser(userData))
  }

  function logout() {
    setUser(null)
  }

  function updateUser(fields) {
    setUser(prev => ({ ...prev, ...fields }))
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}