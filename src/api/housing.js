import { apiFetch } from './config'

// GET /apartments/?city=&state=&max_rent=&skip=0&limit=20
export async function getApartments({ skip = 0, limit = 20, city, state, maxRent } = {}) {
  const params = new URLSearchParams()
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  if (city)    params.set('city', city)
  if (state)   params.set('state', state)
  if (maxRent) params.set('max_rent', String(maxRent))
  return apiFetch(`/apartments/?${params.toString()}`)
}

// GET /apartments/by-location?locations=Toronto&locations=Vancouver
// locations is a list of city/state strings
export async function getApartmentsByLocation(locations = [], skip = 0, limit = 20) {
  const params = new URLSearchParams()
  locations.forEach(loc => params.append('locations', loc))
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  return apiFetch(`/apartments/by-location?${params.toString()}`)
}

// POST /apartments/ — create a new apartment listing
export async function createApartment(payload) {
  return apiFetch('/apartments/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
