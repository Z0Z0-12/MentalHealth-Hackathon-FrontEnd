import { apiFetch } from './config'

// GET /career/listings
// Expected response: [{ id, title, company, location, type, description }]
export async function getCareerListings() {
  return apiFetch('/career/listings')
}

// GET /career/resources
// Expected response: [{ id, title, type, url }]
export async function getCareerResources() {
  return apiFetch('/career/resources')
}