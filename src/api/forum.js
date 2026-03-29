import { apiFetch } from './config'

// GET /forum/posts?skip=0&limit=20 — list all posts
export async function getForumPosts({ skip = 0, limit = 20, category } = {}) {
  const params = new URLSearchParams()
  params.set('skip', String(skip))
  params.set('limit', String(limit))
  if (category) params.set('category', category)
  return apiFetch(`/forum/posts?${params.toString()}`)
}

// POST /forum/posts — create a post
// Body: { title, content, is_anonymous?, category?, tags? }
export async function createForumPost(title, content, isAnonymous = false, category = 'general') {
  return apiFetch('/forum/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, is_anonymous: isAnonymous, category }),
  })
}

// GET /forum/posts/{post_id}/comments
export async function getComments(postId) {
  return apiFetch(`/forum/posts/${postId}/comments`)
}

// POST /forum/posts/{post_id}/comments
export async function createComment(postId, content, isAnonymous = false) {
  return apiFetch(`/forum/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, is_anonymous: isAnonymous }),
  })
}

// POST /forum/posts/{post_id}/like — toggle like
export async function toggleLike(postId) {
  return apiFetch(`/forum/posts/${postId}/like`, { method: 'POST' })
}
