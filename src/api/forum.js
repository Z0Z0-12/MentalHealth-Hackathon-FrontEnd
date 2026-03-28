import { apiFetch } from './config'

// GET /forum/threads
// Expected response: [{ id, title, author, replies, lastActivity }]
export async function getForumThreads() {
  return apiFetch('/forum/threads')
}

// GET /forum/threads/:id
// Expected response: { id, title, posts: [{ id, author, content, time }] }
export async function getThread(threadId) {
  return apiFetch(`/forum/threads/${threadId}`)
}

// POST /forum/threads
// Body: { title, content }
export async function createThread(title, content) {
  return apiFetch('/forum/threads', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })
}