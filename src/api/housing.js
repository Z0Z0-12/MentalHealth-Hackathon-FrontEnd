import { apiFetch } from './config'

// GET /housing/listings
// Expected response: [{ id, title, location, price, type, available }]
export async function getHousingListings() {
  return apiFetch('/housing/listings')
}

// GET /housing/resources
// Expected response: [{ id, title, description, contactUrl }]
export async function getHousingResources() {
  return apiFetch('/housing/resources')
}