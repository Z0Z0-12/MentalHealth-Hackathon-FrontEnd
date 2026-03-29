import { apiFetch } from './config'

// GET /internships/?skip=0&limit=20
// Returns { items: [...], total, skip, limit }
export async function getInternships(skip = 0, limit = 20) {
  return apiFetch(`/internships/?skip=${skip}&limit=${limit}`)
}

// GET /recommendations/me
// Returns [{ id, internship_title, internship_company, internship_location,
//            application_url, score, reason, recommended_for_date }]
export async function getRecommendations() {
  return apiFetch('/recommendations/me')
}

// POST /internships/sync — fetch external internships into the DB
// Returns { target_date, fetched, created, updated, deactivated, skipped, recommendations_generated }
export async function syncInternships() {
  return apiFetch('/internships/sync', { method: 'POST' })
}