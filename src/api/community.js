import { apiFetch } from './config'

// GET /community/posts
// Expected response: [{ id, author, content, likes, comments, time }]
export async function getCommunityPosts() {
  return apiFetch('/community/posts')
}

// POST /community/posts
// Body: { content }
export async function createCommunityPost(content) {
  return apiFetch('/community/posts', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}