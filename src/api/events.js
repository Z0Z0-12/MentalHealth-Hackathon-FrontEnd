import { apiFetch } from './config'

// GET /events/?upcoming_only=true&skip=0&limit=20
export async function getEvents({
  skip = 0,
  limit = 20,
  upcomingOnly = true,
  mode,
  tag,
  hostType,
  startFrom,
  endTo,
} = {}) {
  const params = new URLSearchParams()
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  params.set('upcoming_only', String(upcomingOnly))
  if (mode) params.set('mode', mode)
  if (tag) params.set('tag', tag)
  if (hostType) params.set('host_type', hostType)
  if (startFrom) params.set('start_from', startFrom)
  if (endTo) params.set('end_to', endTo)
  return apiFetch(`/events/?${params.toString()}`)
}

// GET /events/{event_id}
export async function getEvent(eventId) {
  return apiFetch(`/events/${eventId}`)
}

// POST /events/
export async function createEvent(payload) {
  return apiFetch('/events/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// PATCH /events/{event_id}
export async function updateEvent(eventId, payload) {
  return apiFetch(`/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

// POST /events/{event_id}/rsvp
export async function rsvpEvent(eventId) {
  return apiFetch(`/events/${eventId}/rsvp`, { method: 'POST' })
}

// DELETE /events/{event_id}/rsvp (204 No Content)
export async function cancelRsvp(eventId) {
  return apiFetch(`/events/${eventId}/rsvp`, { method: 'DELETE' })
}

// GET /events/{event_id}/rsvp/me
export async function getMyRsvp(eventId) {
  return apiFetch(`/events/${eventId}/rsvp/me`)
}

// GET /events/{event_id}/attendees
export async function getEventAttendees(eventId) {
  return apiFetch(`/events/${eventId}/attendees`)
}

// GET /events/{event_id}/images
export async function getEventImages(eventId) {
  return apiFetch(`/events/${eventId}/images`)
}

// POST /events/{event_id}/banner — multipart upload
export async function uploadBanner(eventId, file) {
  const { API_BASE_URL, getToken } = await import('./config')
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/banner`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

// DELETE /events/{event_id}/banner
export async function deleteBanner(eventId) {
  return apiFetch(`/events/${eventId}/banner`, { method: 'DELETE' })
}

// POST /events/{event_id}/images — multipart upload (multiple files)
export async function uploadEventImages(eventId, files) {
  const { API_BASE_URL, getToken } = await import('./config')
  const token = getToken()
  const form = new FormData()
  Array.from(files).forEach(f => form.append('files', f))
  const res = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

// DELETE /events/{event_id}/images/{image_index}
export async function deleteEventImage(eventId, imageIndex) {
  return apiFetch(`/events/${eventId}/images/${imageIndex}`, { method: 'DELETE' })
}
