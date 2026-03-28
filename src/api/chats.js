import { apiFetch } from './config'

// ── Conversations ──────────────────────────────────────────
// GET /chats/conversations
// Expected response: [{ id, name, avatar, lastMessage, time, unread }]
export async function getConversations() {
  return apiFetch('/chats/conversations')
}

// GET /chats/conversations/:id/messages
// Expected response: [{ id, from, text, time }]
export async function getMessages(conversationId) {
  return apiFetch(`/chats/conversations/${conversationId}/messages`)
}

// POST /chats/conversations/:id/messages
// Body: { text }
// Expected response: { id, from, text, time }
export async function sendMessage(conversationId, text) {
  return apiFetch(`/chats/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}