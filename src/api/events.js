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
