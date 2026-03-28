export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function getToken() {
  return localStorage.getItem('access_token')
}

export function setTokens(access_token, refresh_token) {
  localStorage.setItem('access_token', access_token)
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}