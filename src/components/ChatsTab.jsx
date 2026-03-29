import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  UserPlus,
  Loader2,
} from 'lucide-react'
import {
  getChatRooms,
  getRoomMessages,
  getPendingRequests,
  respondToRequest,
  sendChatRequest,
  getChatWebSocketUrl,
} from '../api/chats'
import { getForumPosts } from '../api/forum'
import { getUserId } from '../api/config'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const avatarColors = [
  'from-pink-300 to-rose-400',
  'from-blue-300 to-indigo-400',
  'from-purple-300 to-violet-400',
  'from-orange-300 to-amber-400',
  'from-teal-300 to-emerald-400',
]

function roomLabel(room, index) {
  return room.name ?? room.other_user_name ?? `Room ${index + 1}`
}

function normalizeMessages(rawMessages, userId) {
  return (rawMessages ?? []).map((msg, index) => {
    const id = msg.id ?? `${msg.sender_id ?? 'anon'}-${msg.created_at ?? msg.timestamp ?? index}`
    const senderId = msg.sender_id ?? null
    return {
      ...msg,
      id,
      sender_id: senderId,
      created_at: msg.created_at ?? msg.timestamp ?? null,
      is_mine: msg.is_mine ?? (senderId != null && String(senderId) === String(userId)),
      content: msg.content ?? msg.text ?? '',
    }
  })
}

function formatMessageTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function normalizeForumPostsPayload(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.posts)) return data.posts
  return []
}

function buildKnownUsers(posts, pendingRequests, currentUserId) {
  const map = new Map()

  const addUser = (id, name) => {
    if (!id) return
    const key = String(id)
    if (String(currentUserId) === key) return

    const cleanName = (name ?? '').trim()
    const existing = map.get(key)

    if (!existing) {
      map.set(key, cleanName || `User ${key.slice(0, 8)}`)
      return
    }

    if ((!existing || existing.startsWith('User ')) && cleanName) {
      map.set(key, cleanName)
    }
  }

  for (const post of posts ?? []) {
    addUser(post.author_id, post.display_name)
  }

  for (const request of pendingRequests ?? []) {
    addUser(request.from_user_id, null)
  }

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}


export default function ChatsTab() {
  const userId = useMemo(() => getUserId(), [])

  const [rooms, setRooms] = useState([])
  const [pending, setPending] = useState([])
  const [knownUsers, setKnownUsers] = useState([])

  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])

  const [loading, setLoading] = useState(true)
  const [roomLoading, setRoomLoading] = useState(false)
  const [view, setView] = useState('rooms') // 'rooms' | 'requests'
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const [sendingRequest, setSendingRequest] = useState(false)

  const [composer, setComposer] = useState('')
  const [sendAnonymous, setSendAnonymous] = useState(false)
  const [socketReady, setSocketReady] = useState(false)

  const wsRef = useRef(null)

  const knownUserMap = useMemo(
    () => new Map(knownUsers.map(user => [String(user.id), user.name])),
    [knownUsers],
  )

  const loadLists = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const [roomsRes, pendingRes, forumRes] = await Promise.allSettled([
      getChatRooms(),
      getPendingRequests(),
      getForumPosts({ skip: 0, limit: 100 }),
    ])

    let nextRooms = []
    let nextPending = []
    let nextError = ''

    if (roomsRes.status === 'fulfilled') {
      nextRooms = roomsRes.value?.rooms ?? roomsRes.value ?? []
      setRooms(nextRooms)
      setActiveId(prev => {
        if (nextRooms.length === 0) return null
        if (prev && nextRooms.some(room => String(room.id) === String(prev))) return prev
        return nextRooms[0].id
      })
    } else {
      nextError = roomsRes.reason?.message ?? 'Could not load chat rooms.'
    }

    if (pendingRes.status === 'fulfilled') {
      nextPending = pendingRes.value ?? []
      setPending(nextPending)
    } else if (!nextError) {
      nextError = pendingRes.reason?.message ?? 'Could not load pending requests.'
    }

    const forumPosts = forumRes.status === 'fulfilled'
      ? normalizeForumPostsPayload(forumRes.value)
      : []

    setKnownUsers(buildKnownUsers(forumPosts, nextPending, userId))
    setError(nextError)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadLists()
  }, [loadLists])

  useEffect(() => {
    if (!activeId || !userId) {
      setMessages([])
      return
    }

    setRoomLoading(true)
    getRoomMessages(activeId)
      .then(data => setMessages(normalizeMessages(data?.messages ?? data ?? [], userId)))
      .catch(err => setError(err.message ?? 'Could not load messages.'))
      .finally(() => setRoomLoading(false))
  }, [activeId, userId])

  useEffect(() => {
    if (!activeId || !userId) return undefined

    setSocketReady(false)

    const wsUrl = getChatWebSocketUrl(activeId, userId)
    if (!wsUrl) return undefined

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setSocketReady(true)
    }

    ws.onmessage = event => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type !== 'message') return
        if (payload.room_id && String(payload.room_id) !== String(activeId)) return

        const incoming = normalizeMessages([payload], userId)[0]
        setMessages(prev => (prev.some(m => String(m.id) === String(incoming.id)) ? prev : [...prev, incoming]))
      } catch {
        // Ignore malformed websocket events
      }
    }

    ws.onclose = () => setSocketReady(false)
    ws.onerror = () => setSocketReady(false)

    return () => {
      setSocketReady(false)
      if (wsRef.current === ws) wsRef.current = null
      ws.close()
    }
  }, [activeId, userId])

  async function handleRespond(requestId, accept) {
    try {
      const updated = await respondToRequest(requestId, accept)
      setPending(prev => prev.filter(r => String(r.id) !== String(requestId)))

      if (accept && updated?.room_id) {
        const roomId = String(updated.room_id)
        setRooms(prev => (prev.some(r => String(r.id) === roomId)
          ? prev
          : [{ id: roomId, room_type: 'direct', name: null }, ...prev]))
        setActiveId(roomId)
        setView('rooms')
      }

      if (updated?.from_user_id) {
        const senderId = String(updated.from_user_id)
        setKnownUsers(prev => (
          prev.some(user => String(user.id) === senderId)
            ? prev
            : [...prev, { id: senderId, name: `User ${senderId.slice(0, 8)}` }]
        ))
      }

      setStatus(accept ? 'Chat request accepted.' : 'Chat request declined.')
      setError('')
    } catch (err) {
      setError(err.message ?? 'Could not respond to request.')
    }
  }

  async function handleSendRequest(toUserId) {
    if (!toUserId?.trim()) { setError('Please enter a user ID.'); return }

    setSendingRequest(true)
    setStatus('')
    setError('')

    try {
      await sendChatRequest(toUserId.trim())
      setNewRequestInput('')
      setStatus('Chat request sent!')
    } catch (err) {
      setError(err.message ?? 'Could not send chat request.')
    } finally {
      setSendingRequest(false)
    }
  }

  function handleSendMessage(e) {
    e.preventDefault()
    const content = composer.trim()
    if (!content || !activeId) return

    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('Live chat is not connected yet. Please wait a moment and try again.')
      return
    }

    ws.send(JSON.stringify({ content, is_anonymous: sendAnonymous }))
    setComposer('')
    setSendAnonymous(false)
    setError('')
  }

  const active = rooms.find(r => String(r.id) === String(activeId)) ?? null

  if (!userId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
        <MessageCircle size={32} style={{ color: '#c0d8c0' }} />
        <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          Log in to access chats.
        </p>
      </div>
    )
  }

  if (loading) return <LoadingState />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: 'rooms', label: 'Messages' },
          { key: 'requests', label: `Requests${pending.length > 0 ? ` (${pending.length})` : ''}` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 16px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: view === t.key ? '#0a2a0f' : 'rgba(255,255,255,0.5)',
              color: view === t.key ? '#dff89a' : '#3a6040',
              transition: 'background 0.2s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status && (
        <p style={{ margin: 0, fontSize: '11px', color: '#3a6040', fontFamily: "'DM Sans', sans-serif" }}>
          {status}
        </p>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c', fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}

      {view === 'requests' ? (
        <RequestsView
          pending={pending}
          knownUsers={knownUsers}
          knownUserMap={knownUserMap}
          onRespond={handleRespond}
          onSendRequest={handleSendRequest}
          sendingRequest={sendingRequest}
        />
      ) : (
        <RoomsView
          rooms={rooms}
          active={active}
          activeId={activeId}
          messages={messages}
          setActiveId={setActiveId}
          roomLoading={roomLoading}
          onRefresh={loadLists}
          composer={composer}
          setComposer={setComposer}
          sendAnonymous={sendAnonymous}
          setSendAnonymous={setSendAnonymous}
          onSendMessage={handleSendMessage}
          socketReady={socketReady}
        />
      )}
    </div>
  )
}

function RoomsView({
  rooms,
  active,
  activeId,
  messages,
  setActiveId,
  roomLoading,
  onRefresh,
  composer,
  setComposer,
  sendAnonymous,
  setSendAnonymous,
  onSendMessage,
  socketReady,
}) {
  if (rooms.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
        <MessageCircle size={32} style={{ color: '#c0d8c0' }} />
        <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          No conversations yet.
        </p>
        <p style={{ fontSize: '11px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          Send or accept a chat request to start messaging.
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full gap-4" style={{ flex: 1, minHeight: 0 }}>
      <div
        style={{
          width: '240px',
          minWidth: '240px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 16px 10px',
            fontWeight: 700,
            fontSize: '13px',
            color: '#0a2a0f',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Messages
          <button
            onClick={onRefresh}
            title="Refresh"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#3a6040',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rooms.map((room, i) => {
            const label = roomLabel(room, i)
            const initial = label[0]?.toUpperCase() ?? '?'

            return (
              <button
                key={room.id}
                onClick={() => setActiveId(room.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: String(activeId) === String(room.id) ? 'rgba(255,255,255,0.5)' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              >
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}
                >
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{initial}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0a2a0f',
                      fontFamily: "'DM Sans', sans-serif",
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#5a8060',
                      fontFamily: "'DM Sans', sans-serif",
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {room.room_type === 'association' ? 'Association room' : 'Direct message'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {active ? (
          <>
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(10,42,15,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0a2a0f',
                  fontFamily: "'DM Sans', sans-serif",
                  margin: 0,
                }}
              >
                {roomLabel(active, 0)}
              </p>
              <span
                style={{
                  fontSize: '10px',
                  borderRadius: '999px',
                  padding: '3px 8px',
                  background: socketReady ? 'rgba(22,163,74,0.14)' : 'rgba(250,204,21,0.18)',
                  color: socketReady ? '#15803d' : '#92400e',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                {socketReady ? 'Live' : 'Connecting...'}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {roomLoading ? (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#9ab09a',
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: '32px',
                  }}
                >
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#9ab09a',
                    fontFamily: "'DM Sans', sans-serif",
                    marginTop: '32px',
                  }}
                >
                  No messages yet
                </p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.is_mine ? 'flex-end' : 'flex-start',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '16px',
                        fontSize: '13px',
                        maxWidth: '70%',
                        background: msg.is_mine ? '#0a2a0f' : 'rgba(255,255,255,0.7)',
                        color: msg.is_mine ? '#dff89a' : '#0a2a0f',
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.created_at && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#7da284',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {formatMessageTime(msg.created_at)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={onSendMessage}
              style={{
                borderTop: '1px solid rgba(10,42,15,0.07)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  value={composer}
                  onChange={e => setComposer(e.target.value)}
                  placeholder="Type a message"
                  style={{
                    flex: 1,
                    border: '1px solid rgba(10,42,15,0.15)',
                    borderRadius: '999px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'rgba(255,255,255,0.7)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!composer.trim()}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '999px',
                    border: 'none',
                    background: '#0a2a0f',
                    color: '#dff89a',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: composer.trim() ? 'pointer' : 'not-allowed',
                    opacity: composer.trim() ? 1 : 0.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Send size={12} /> Send
                </button>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#5a8060',
                  fontFamily: "'DM Sans', sans-serif",
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={sendAnonymous}
                  onChange={e => setSendAnonymous(e.target.checked)}
                />
                Send anonymously
              </label>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '13px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>
              Select a conversation
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function RequestsView({ pending, knownUsers, knownUserMap, onRespond, onSendRequest, sendingRequest }) {
  const [uuidInput, setUuidInput] = useState('')
  const [sendingId, setSendingId] = useState(null) // which known user is being requested

  async function handleSendToKnown(userId) {
    setSendingId(userId)
    await onSendRequest(userId)
    setSendingId(null)
  }

  async function handleSendByUuid(e) {
    e.preventDefault()
    await onSendRequest(uuidInput)
    setUuidInput('')
  }

  const inputStyle = {
    flex: 1, border: '1px solid rgba(10,42,15,0.15)', borderRadius: '999px',
    padding: '8px 12px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
    background: 'rgba(255,255,255,0.7)', outline: 'none',
  }

  const sectionLabel = (text) => (
    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#3a6040', fontFamily: "'DM Sans', sans-serif" }}>
      {text}
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Send a request ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sectionLabel('Send a Chat Request')}

        {/* Known users from forum — clickable rows */}
        {knownUsers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#7da284', fontFamily: "'DM Sans', sans-serif" }}>
              People you've seen on the forum:
            </p>
            {knownUsers.map(u => (
              <div key={u.id} style={{
                background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(10,42,15,0.07)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#4a7c59,#265d34)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#dff89a', fontSize: '12px', fontWeight: 700 }}>
                    {u.name[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                    {u.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.id}
                  </p>
                </div>
                <button
                  onClick={() => handleSendToKnown(u.id)}
                  disabled={sendingId === u.id || sendingRequest}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                    padding: '5px 12px', borderRadius: '999px', border: 'none',
                    background: '#0a2a0f', color: '#dff89a', fontSize: '11px', fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: sendingId === u.id ? 'default' : 'pointer',
                    opacity: sendingId === u.id ? 0.6 : 1,
                  }}
                >
                  {sendingId === u.id
                    ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
                    : <><UserPlus size={11} /> Request</>
                  }
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* UUID direct input — always visible */}
        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '12px', border: '1px solid rgba(10,42,15,0.07)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#7da284', fontFamily: "'DM Sans', sans-serif" }}>
            Know someone's User ID? Paste it here:
          </p>
          <form onSubmit={handleSendByUuid} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={uuidInput}
              onChange={e => setUuidInput(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={sendingRequest || !uuidInput.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                padding: '8px 14px', borderRadius: '999px', border: 'none',
                background: uuidInput.trim() ? '#0a2a0f' : '#d1d5db',
                color: '#dff89a', fontSize: '11px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: uuidInput.trim() && !sendingRequest ? 'pointer' : 'default',
              }}
            >
              {sendingRequest && !sendingId
                ? <><Loader2 size={11} className="animate-spin" /> Sending…</>
                : <><UserPlus size={11} /> Send</>
              }
            </button>
          </form>
          <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
            You can find someone's User ID on their profile or in the forum.
          </p>
        </div>
      </div>

      {/* ── Incoming pending requests ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sectionLabel(`Incoming Requests${pending.length > 0 ? ` (${pending.length})` : ''}`)}

        {pending.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 0' }}>
            <Clock size={28} style={{ color: '#c0d8c0' }} />
            <p style={{ fontSize: '12px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
              No pending requests.
            </p>
          </div>
        ) : (
          pending.map(req => {
            const fromId = String(req.from_user_id)
            const label  = knownUserMap.get(fromId) ?? `User ${fromId.slice(0, 8)}…`
            return (
              <div key={req.id} style={{
                background: 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(10,42,15,0.07)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#f97316,#ec4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>
                    {label[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                    {label}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                    wants to chat
                  </p>
                </div>
                <button onClick={() => onRespond(req.id, true)} style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                  borderRadius: '999px', border: 'none', background: '#0a2a0f', color: '#dff89a',
                  fontSize: '11px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}>
                  <CheckCircle size={12} /> Accept
                </button>
                <button onClick={() => onRespond(req.id, false)} style={{
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                  borderRadius: '999px', border: '1px solid rgba(220,38,38,0.3)', background: 'transparent',
                  color: '#dc2626', fontSize: '11px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}>
                  <XCircle size={12} /> Decline
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', gap: '12px', height: '100%' }}>
      {[240, null].map((w, i) => (
        <div
          key={i}
          style={{
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.4)',
            width: w ?? '100%',
            minHeight: '200px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  )
}
