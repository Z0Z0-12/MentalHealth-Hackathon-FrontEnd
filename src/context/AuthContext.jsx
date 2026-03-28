import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const saveToken = (accessToken) => {
    setToken(accessToken)
    localStorage.setItem('access_token', accessToken)
  }

  const clearAuth = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }, [])

  const fetchMe = useCallback(async (accessToken) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error('Failed to fetch user')
    return res.json()
  }, [])

  const refresh = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) throw new Error('No refresh token')
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    saveToken(data.access_token)
    return data.access_token
  }, [])

  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return }
      try {
        const me = await fetchMe(token)
        setUser(me)
      } catch {
        try {
          const newToken = await refresh()
          const me = await fetchMe(newToken)
          setUser(me)
        } catch {
          clearAuth()
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    setError(null)
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Login failed')
    }
    const data = await res.json()
    saveToken(data.access_token)
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
    const me = await fetchMe(data.access_token)
    setUser(me)
    return me
  }

  const register = async (role, payload) => {
    setError(null)
    const endpoint = {
      student:    '/api/v1/auth/register/student',
      university: '/api/v1/auth/register/university',
      admin:      '/api/v1/auth/register/admin',
    }[role]
    if (!endpoint) throw new Error(`Unknown role: ${role}`)
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Registration failed')
    }
    const data = await res.json()
    if (data.access_token) {
      saveToken(data.access_token)
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
      const me = await fetchMe(data.access_token)
      setUser(me)
      return me
    }
    return data
  }

  const loginWithGoogle = async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/google/url`)
    if (!res.ok) throw new Error('Could not get Google SSO URL')
    const { url } = await res.json()
    window.location.href = url
  }

  const handleGoogleCallback = async (code) => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/google/callback?code=${code}`)
    if (!res.ok) throw new Error('Google auth failed')
    const data = await res.json()
    saveToken(data.access_token)
    if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
    const me = await fetchMe(data.access_token)
    setUser(me)
    return me
  }

  const logout = () => clearAuth()

  const updateUser = (fields) => setUser(prev => ({ ...prev, ...fields }))

  const isAuthenticated = !!user
  const isStudent       = user?.role === 'student'
  const isUniversity    = user?.role === 'university'
  const isAdmin         = user?.role === 'admin'

  const dashboardPath = () => {
    if (isStudent)    return '/dashboard/student'
    if (isUniversity) return '/dashboard/university'
    if (isAdmin)      return '/dashboard/admin'
    return '/'
  }

  const authFetch = useCallback(async (url, options = {}) => {
    const doRequest = (t) =>
      fetch(url.startsWith('http') ? url : `${BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${t}`,
        },
      })
    let res = await doRequest(token)
    if (res.status === 401) {
      try {
        const newToken = await refresh()
        res = await doRequest(newToken)
      } catch {
        clearAuth()
        throw new Error('Session expired. Please log in again.')
      }
    }
    return res
  }, [token, refresh, clearAuth])

  const value = {
    user,
    token,
    loading,
    error,
    setError,
    isAuthenticated,
    isStudent,
    isUniversity,
    isAdmin,
    dashboardPath,
    login,
    register,
    logout,
    loginWithGoogle,
    handleGoogleCallback,
    refresh,
    updateUser,
    authFetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
