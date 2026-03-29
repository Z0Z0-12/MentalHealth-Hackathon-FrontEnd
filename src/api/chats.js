import { API_BASE_URL, apiFetch, getToken, getUserId } from './config'

function chatHeaders() {
  const userId = getUserId()
  return userId ? { 'x-user-id': userId } : {}
}

// GET /chat/users/search?q=... — search users by name/email
export async function searchChatUsers(query) {
  const params = new URLSearchParams({ q: query })
  return apiFetch(`/chat/users/search?${params.toString()}`, { headers: chatHeaders() })
}

// GET /chat/rooms — get my chat rooms
export async function getChatRooms() {
  return apiFetch('/chat/rooms', { headers: chatHeaders() })
}

// GET /chat/rooms/{room_id}/messages — fetch message history
export async function getRoomMessages(roomId) {
  return apiFetch(`/chat/rooms/${roomId}/messages`, { headers: chatHeaders() })
}

// POST /chat/rooms/{room_id}/messages — send a message
export async function sendMessage(roomId, content, isAnonymous = false) {
  return apiFetch(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: chatHeaders(),
    body: JSON.stringify({ content, is_anonymous: isAnonymous }),
  })
}

// GET /chat/requests/pending — incoming requests
export async function getPendingRequests() {
  return apiFetch('/chat/requests/pending', { headers: chatHeaders() })
}

// GET /chat/requests/outgoing — outgoing requests
export async function getOutgoingRequests() {
  return apiFetch('/chat/requests/outgoing', { headers: chatHeaders() })
}

// POST /chat/requests — send a chat request by user UUID
export async function sendChatRequest(toUserId) {
  return apiFetch('/chat/requests', {
    method: 'POST',
    headers: chatHeaders(),
    body: JSON.stringify({ to_user_id: toUserId }),
  })
}

// POST /chat/requests/{request_id}/respond — accept or decline
export async function respondToRequest(requestId, accept) {
  return apiFetch(`/chat/requests/${requestId}/respond`, {
    method: 'POST',
    headers: chatHeaders(),
    body: JSON.stringify({ accept }),
  })
}

// WebSocket — auth via ?token= (Bearer token in query string)
export function getChatWebSocketUrl(roomId) {
  const token = getToken()
  if (!roomId || !token) return null
  const url = new URL(`${API_BASE_URL}/api/v1/chat/ws/${roomId}`)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('token', token)
  return url.toString()
}
