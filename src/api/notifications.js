// Notifications endpoint not yet available on the backend.
// Returns empty array so the UI shows "No notifications yet" gracefully.

export async function getNotifications() {
  return []
}

export async function markAllNotificationsRead() {
  return {}
}