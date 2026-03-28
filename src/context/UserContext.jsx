import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/auth'

const UserContext = createContext(null)

// Wrap the whole app in this so any component can access the logged-in user
export function UserProvider({ children }) {
  const [user, setUser]       = useState(null)   // null = not loaded yet
  const [loading, setLoading] = useState(true)

  // On app load, fetch the current user from the backend
  // If the backend isn't ready yet, this will silently fail and user stays null
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))   // not logged in or backend not up yet
      .finally(() => setLoading(false))
  }, [])

  // Call this after a successful login to update the user globally
  function login(userData) {
    setUser(userData)
  }

  // Call this on logout to clear the user everywhere
  function logout() {
    setUser(null)
  }

  // Call this after updating profile fields
  function updateUser(fields) {
    setUser(prev => ({ ...prev, ...fields }))
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

// Shortcut hook — any component can call: const { user } = useUser()
export function useUser() {
  return useContext(UserContext)
}