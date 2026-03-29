import { API_BASE_URL, apiFetch, getUserId } from './config'

function chatHeaders() {
  const userId = getUserId()
  return userId ? { 'x-user-id': userId } : {}
}

// GET /chat/rooms — get all my chat rooms
export async function getChatRooms() {
  return apiFetch('/chat/rooms', { headers: chatHeaders() })
}

// GET /chat/rooms/{room_id}/messages — get messages in a room
export async function getRoomMessages(roomId) {
  return apiFetch(`/chat/rooms/${roomId}/messages`, { headers: chatHeaders() })
}

// GET /chat/requests/pending — get pending chat requests
export async function getPendingRequests() {
  return apiFetch('/chat/requests/pending', { headers: chatHeaders() })
}

// POST /chat/requests — send a chat request to a user
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

// WS /chat/ws/{room_id}?user_id=... — real-time room messages
export function getChatWebSocketUrl(roomId, userId = getUserId()) {
  if (!roomId || !userId) return null
  const url = new URL(`${API_BASE_URL}/api/v1/chat/ws/${roomId}`)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('user_id', userId)
  return url.toString()
}
