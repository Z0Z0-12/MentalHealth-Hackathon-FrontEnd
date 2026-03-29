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

export function getUserId() {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? null
  } catch { return null }
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const { headers: extraHeaders, ...restOptions } = options
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    ...restOptions,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let detail = ''
    try {
      if (isJson) {
        const errorBody = await response.json()
        if (typeof errorBody?.detail === 'string') {
          detail = errorBody.detail
        } else if (Array.isArray(errorBody?.detail)) {
          detail = errorBody.detail.map(item => item?.msg).filter(Boolean).join(', ')
        }
      } else {
        detail = (await response.text()).trim()
      }
    } catch {
      // fall back to status text when body parsing fails
    }
    throw new Error(`API error ${response.status}: ${detail || response.statusText}`)
  }

  if (response.status === 204 || response.status === 205) return null
  if (!isJson) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}
