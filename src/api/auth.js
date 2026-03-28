import { apiFetch, setTokens, clearTokens } from './config'

// POST /auth/login
// Returns { access_token, refresh_token, token_type, expires_in }
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

// POST /auth/register/student
export async function registerStudent(fields) {
  const data = await apiFetch('/auth/register/student', {
    method: 'POST',
    body: JSON.stringify(fields),
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

// Logout — clears tokens locally (no backend logout endpoint)
export async function logout() {
  clearTokens()
}

// GET /auth/me — returns the logged-in user's info
export async function getMe() {
  return apiFetch('/auth/me')
}

// PATCH /student-profiles/me — update profile fields
export async function updateMe(fields) {
  return apiFetch('/student-profiles/me', {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

// GET /universities/ — fetch list for registration dropdown
export async function getUniversities() {
  return apiFetch('/universities/')
}