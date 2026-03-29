import { apiFetch } from './config'

// GET /apartments/?skip=0&limit=20 — list all apartments
export async function getApartments(skip = 0, limit = 20) {
  return apiFetch(`/apartments/?skip=${skip}&limit=${limit}`)
}

// GET /apartments/by-location — list apartments by location
export async function getApartmentsByLocation(city, state) {
  const params = new URLSearchParams()
  if (city)  params.append('city', city)
  if (state) params.append('state', state)
  return apiFetch(`/apartments/by-location?${params.toString()}`)
}