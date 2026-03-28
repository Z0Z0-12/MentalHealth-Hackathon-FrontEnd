import { apiFetch } from './config'

// POST /auth/login
// Body: { email, password }
// Expected response: { access_token, token_type, user: { id, name, email, role, joined } }
export async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// POST /auth/logout
// Invalidates the session/token on the backend
export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' })
}

// GET /auth/me
// Returns the currently logged in user's profile
// Expected response: { id, name, email, role, joined }
export async function getMe() {
  return apiFetch('/auth/me')
}

// PATCH /auth/me
// Body: { name?, email?, phone? }
// Updates the user's profile fields
export async function updateMe(fields) {
  return apiFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}