// Bridges old useUser() and UserProvider calls to the new AuthContext
// This keeps Navbar, ProfileMenu, AccountPage etc. working without changes
export { AuthProvider as UserProvider, useAuth as useUser } from './AuthContext'
