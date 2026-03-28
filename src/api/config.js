// Base URL for your FastAPI backend
// During development your backend runs locally on port 8000 (FastAPI default)
// When deployed, replace this with the real server URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Generic fetch helper — all API calls go through this
export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}