import { apiFetch } from './config'

// GET /notifications
// Expected response: [{ id, text, time, read }]
export async function getNotifications() {
  return apiFetch('/notifications')
}

// PATCH /notifications/read-all
// Marks all notifications as read on the backend
export async function markAllNotificationsRead() {
  return apiFetch('/notifications/read-all', { method: 'PATCH' })
}