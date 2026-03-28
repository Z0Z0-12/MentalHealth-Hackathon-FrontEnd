import { apiFetch } from './config'

// GET /events/?skip=0&limit=20
export async function getEvents(skip = 0, limit = 20) {
  return apiFetch(`/events/?skip=${skip}&limit=${limit}`)
}

// GET /events/{event_id}
export async function getEvent(eventId) {
  return apiFetch(`/events/${eventId}`)
}

// POST /events/{event_id}/rsvp
export async function rsvpEvent(eventId) {
  return apiFetch(`/events/${eventId}/rsvp`, { method: 'POST' })
}

// DELETE /events/{event_id}/rsvp
export async function cancelRsvp(eventId) {
  return apiFetch(`/events/${eventId}/rsvp`, { method: 'DELETE' })
}

// GET /events/{event_id}/rsvp/me
export async function getMyRsvp(eventId) {
  return apiFetch(`/events/${eventId}/rsvp/me`)
}