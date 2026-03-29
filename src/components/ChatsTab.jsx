import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MessageCircle, Clock, CheckCircle, XCircle, Send,
  RefreshCw, UserPlus, Loader2, Search,
} from 'lucide-react'
import {
  getChatRooms, getRoomMessages, getPendingRequests, getOutgoingRequests,
  respondToRequest, sendChatRequest, searchChatUsers, sendMessage,
  getChatWebSocketUrl,
} from '../api/chats'
import { getUserId } from '../api/config'

// ─── helpers ──────────────────────────────────────────────────────────────────

const avatarColors = [
  'from-pink-300 to-rose-400',
  'from-blue-300 to-indigo-400',
  'from-purple-300 to-violet-400',
  'from-orange-300 to-amber-400',
  'from-teal-300 to-emerald-400',
]

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function normalizeMessages(raw, myId) {
  return (raw ?? []).map((msg, i) => ({
    ...msg,
    id: msg.id ?? `${msg.sender_id}-${msg.created_at ?? i}`,
    content: msg.content ?? msg.text ?? '',
    is_mine: msg.is_mine ?? (msg.sender_id != null && String(msg.sender_id) === String(myId)),
    created_at: msg.created_at ?? msg.timestamp ?? null,
  }))
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ChatsTab() {
  const myId = getUserId()

  const [view, setView]                   = useState('rooms') // 'rooms' | 'requests'
  const [rooms, setRooms]                 = useState([])
  const [incoming, setIncoming]           = useState([])
  const [outgoing, setOutgoing]           = useState([])
  const [activeRoomId, setActiveRoomId]   = useState(null)
  const [messages, setMessages]           = useState([])

  const [loading, setLoading]             = useState(true)
  const [roomLoading, setRoomLoading]     = useState(false)
  const [sending, setSending]             = useState(false)
  const [socketReady, setSocketReady]     = useState(false)

  const [error, setError]     = useState('')
  const [status, setStatus]   = useState('')
  const [composer, setComposer]           = useState('')
  const [sendAnon, setSendAnon]           = useState(false)

  const wsRef      = useRef(null)
  const bottomRef  = useRef(null)
  const sendingRef = useRef(false)

  // ── load rooms + requests ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!myId) { setLoading(false); return }
    setLoading(true)
    setError('')

    const [roomsRes, incomingRes, outgoingRes] = await Promise.allSettled([
      getChatRooms(),
      getPendingRequests(),
      getOutgoingRequests(),
    ])

    if (roomsRes.status === 'fulfilled') {
      const r = roomsRes.value?.rooms ?? roomsRes.value ?? []
      setRooms(r)
      setActiveRoomId(prev => {
        if (!prev && r.length > 0) return r[0].id
        return prev
      })
    } else {
      setError(roomsRes.reason?.message ?? 'Could not load rooms.')
    }

    if (incomingRes.status === 'fulfilled') {
      setIncoming(incomingRes.value?.requests ?? incomingRes.value ?? [])
    }
    if (outgoingRes.status === 'fulfilled') {
      setOutgoing(outgoingRes.value?.requests ?? outgoingRes.value ?? [])
    }

    setLoading(false)
  }, [myId])

  useEffect(() => { loadAll() }, [loadAll])

  // ── fetch messages when room changes ────────────────────────────────────────
  useEffect(() => {
    if (!activeRoomId) { setMessages([]); return }
    setRoomLoading(true)
    getRoomMessages(activeRoomId)
      .then(data => setMessages(normalizeMessages(data?.messages ?? data ?? [], myId)))
      .catch(err => setError(err.message))
      .finally(() => setRoomLoading(false))
  }, [activeRoomId, myId])

  // ── websocket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoomId) return
    setSocketReady(false)

    const wsUrl = getChatWebSocketUrl(activeRoomId)
    if (!wsUrl) return

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen  = () => setSocketReady(true)
    ws.onclose = () => setSocketReady(false)
    ws.onerror = () => setSocketReady(false)

    ws.onmessage = e => {
      try {
        const payload = JSON.parse(e.data)
        if (payload.type !== 'message') return
        if (payload.room_id && String(payload.room_id) !== String(activeRoomId)) return
        const msg = normalizeMessages([payload], myId)[0]
        // Own messages are handled optimistically via POST — skip them from WebSocket
        if (msg.is_mine) return
        setMessages(prev => prev.some(m => String(m.id) === String(msg.id)) ? prev : [...prev, msg])
      } catch { /* ignore */ }
    }

    return () => { wsRef.current = null; ws.close() }
  }, [activeRoomId, myId])

  // ── auto-scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── send message (POST) ──────────────────────────────────────────────────────
  async function handleSendMessage(e) {
    e.preventDefault()
    const content = composer.trim()
    if (!content || !activeRoomId || sendingRef.current) return

    sendingRef.current = true
    setSending(true)
    setError('')
    const optimistic = {
      id: `opt-${Date.now()}`, content, is_mine: true, created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setComposer('')

    try {
      const saved = await sendMessage(activeRoomId, content, sendAnon)
      if (saved) {
        setMessages(prev => prev.map(m => m.id === optimistic.id
          ? normalizeMessages([saved], myId)[0]
          : m
        ))
      }
      setSendAnon(false)
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setComposer(content)
      setError(err.message)
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  // ── respond to incoming request ──────────────────────────────────────────────
  async function handleRespond(requestId, accept) {
    try {
      const res = await respondToRequest(requestId, accept)
      setIncoming(prev => prev.filter(r => String(r.id) !== String(requestId)))
      if (accept && res?.room_id) {
        const roomId = String(res.room_id)
        setRooms(prev => prev.some(r => String(r.id) === roomId)
          ? prev
          : [{ id: roomId, room_type: 'direct', direct_display_name: res.direct_display_name ?? 'New chat' }, ...prev]
        )
        setActiveRoomId(roomId)
        setView('rooms')
      }
      setStatus(accept ? 'Request accepted — chat opened.' : 'Request declined.')
    } catch (err) {
      setError(err.message)
    }
  }

  // ── send request (from search result, using UUID) ────────────────────────────
  async function handleSendRequest(userId, onSuccess) {
    try {
      await sendChatRequest(userId)
      setStatus('Chat request sent!')
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    }
  }

  // ── open room from search result ─────────────────────────────────────────────
  function handleOpenRoom(roomId) {
    setActiveRoomId(String(roomId))
    setView('rooms')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  if (!myId) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <MessageCircle size={32} style={{ color: '#c0d8c0' }} />
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>Log in to access chats.</p>
    </div>
  )

  if (loading) return <LoadingState />

  const totalPending = incoming.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>

      {/* tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: 'rooms',    label: 'Messages' },
          { key: 'requests', label: `Requests${totalPending > 0 ? ` (${totalPending})` : ''}` },
        ].map(t => (
          <button key={t.key} onClick={() => { setView(t.key); setError(''); setStatus('') }}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
              padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              background: view === t.key ? '#0a2a0f' : 'rgba(255,255,255,0.5)',
              color: view === t.key ? '#dff89a' : '#3a6040',
            }}
          >{t.label}</button>
        ))}
        <button onClick={loadAll} title="Refresh" style={{
          marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#5a8060',
          display: 'flex', alignItems: 'center',
        }}>
          <RefreshCw size={13} />
        </button>
      </div>

      {status && <p style={{ margin: 0, fontSize: '11px', color: '#3a6040', fontFamily: "'DM Sans', sans-serif" }}>{status}</p>}
      {error  && <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}

      {view === 'requests'
        ? <RequestsView
            incoming={incoming}
            outgoing={outgoing}
            onRespond={handleRespond}
            onSendRequest={handleSendRequest}
            onOpenRoom={handleOpenRoom}
          />
        : <RoomsView
            rooms={rooms}
            activeRoomId={activeRoomId}
            setActiveRoomId={setActiveRoomId}
            messages={messages}
            roomLoading={roomLoading}
            socketReady={socketReady}
            composer={composer}
            setComposer={setComposer}
            sendAnon={sendAnon}
            setSendAnon={setSendAnon}
            sending={sending}
            onSendMessage={handleSendMessage}
            bottomRef={bottomRef}
          />
      }
    </div>
  )
}

// ─── RoomsView ────────────────────────────────────────────────────────────────

function RoomsView({
  rooms, activeRoomId, setActiveRoomId,
  messages, roomLoading, socketReady,
  composer, setComposer, sendAnon, setSendAnon, sending,
  onSendMessage, bottomRef,
}) {
  const active = rooms.find(r => String(r.id) === String(activeRoomId)) ?? null

  if (rooms.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <MessageCircle size={32} style={{ color: '#c0d8c0' }} />
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>No conversations yet.</p>
      <p style={{ fontSize: '11px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>Send or accept a chat request to start messaging.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>

      {/* room list */}
      <div style={{
        width: '220px', minWidth: '220px', background: 'rgba(255,255,255,0.5)',
        borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <p style={{ margin: 0, padding: '14px 14px 8px', fontSize: '12px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
          Conversations
        </p>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rooms.map((room, i) => {
            const name    = room.direct_display_name ?? room.name ?? `Room ${i + 1}`
            const preview = room.last_message_preview
            const active  = String(room.id) === String(activeRoomId)
            return (
              <button key={room.id} onClick={() => setActiveRoomId(room.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(255,255,255,0.6)' : 'transparent',
                }}
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{name[0]?.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </p>
                  {preview && (
                    <p style={{ margin: 0, fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {preview}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* conversation */}
      <div style={{
        flex: 1, background: 'rgba(255,255,255,0.5)', borderRadius: '16px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {active ? (
          <>
            {/* header */}
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid rgba(10,42,15,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                {active.direct_display_name ?? active.name ?? 'Chat'}
              </p>
              <span style={{
                fontSize: '10px', borderRadius: '999px', padding: '2px 8px', fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                background: socketReady ? 'rgba(22,163,74,0.14)' : 'rgba(250,204,21,0.18)',
                color: socketReady ? '#15803d' : '#92400e',
              }}>
                {socketReady ? 'Live' : 'Connecting…'}
              </span>
            </div>

            {/* messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roomLoading ? (
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif", marginTop: '32px' }}>Loading messages…</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif", marginTop: '32px' }}>No messages yet — say hello!</p>
              ) : messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_mine ? 'flex-end' : 'flex-start', gap: '3px' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '16px', fontSize: '13px', maxWidth: '72%',
                    background: msg.is_mine ? '#0a2a0f' : 'rgba(255,255,255,0.8)',
                    color: msg.is_mine ? '#dff89a' : '#0a2a0f',
                    fontFamily: "'DM Sans', sans-serif", whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    opacity: msg.id?.startsWith('opt-') ? 0.7 : 1,
                  }}>
                    {msg.content}
                  </div>
                  {msg.created_at && (
                    <span style={{ fontSize: '10px', color: '#7da284', fontFamily: "'DM Sans', sans-serif" }}>
                      {formatTime(msg.created_at)}
                    </span>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* composer */}
            <form onSubmit={onSendMessage} style={{
              borderTop: '1px solid rgba(10,42,15,0.07)', padding: '12px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  value={composer} onChange={e => setComposer(e.target.value)}
                  placeholder="Type a message…"
                  style={{
                    flex: 1, border: '1px solid rgba(10,42,15,0.15)', borderRadius: '999px',
                    padding: '8px 14px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
                    background: 'rgba(255,255,255,0.7)', outline: 'none',
                  }}
                />
                <button type="submit" disabled={!composer.trim() || sending}
                  style={{
                    padding: '8px 14px', borderRadius: '999px', border: 'none',
                    background: '#0a2a0f', color: '#dff89a', fontSize: '11px', fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif", cursor: composer.trim() ? 'pointer' : 'not-allowed',
                    opacity: composer.trim() ? 1 : 0.5,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Send
                </button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", userSelect: 'none' }}>
                <input type="checkbox" checked={sendAnon} onChange={e => setSendAnon(e.target.checked)} />
                Send anonymously
              </label>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '13px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── RequestsView ─────────────────────────────────────────────────────────────

function RequestsView({ incoming, outgoing, onRespond, onSendRequest, onOpenRoom }) {
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [searching, setSearching]   = useState(false)
  const [searchErr, setSearchErr]   = useState('')
  const [busyId, setBusyId]         = useState(null)
  const timerRef = useRef(null)

  function handleQueryChange(e) {
    const q = e.target.value
    setQuery(q)
    setSearchErr('')
    clearTimeout(timerRef.current)
    if (!q.trim()) { setResults([]); return }

    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchChatUsers(q.trim())
        setResults(data?.users ?? [])
      } catch (err) {
        setSearchErr(err.message)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  async function handleSend(user) {
    setBusyId(user.id)
    await onSendRequest(user.id, () => {
      setResults(prev => prev.map(u => u.id === user.id
        ? { ...u, relationship_status: 'outgoing_pending' }
        : u
      ))
    })
    setBusyId(null)
  }

  async function handleAcceptFromSearch(user) {
    setBusyId(user.id)
    await onRespond(user.request_id, true)
    setResults(prev => prev.map(u => u.id === user.id
      ? { ...u, relationship_status: 'connected' }
      : u
    ))
    setBusyId(null)
  }

  const sectionLabel = text => (
    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#3a6040', fontFamily: "'DM Sans', sans-serif" }}>
      {text}
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* ── Search users ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sectionLabel('Find People')}

        <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '12px', border: '1px solid rgba(10,42,15,0.07)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.8)', borderRadius: '999px',
            padding: '8px 12px', border: '1px solid rgba(10,42,15,0.12)',
          }}>
            {searching
              ? <Loader2 size={13} style={{ color: '#9ca3af', flexShrink: 0 }} className="animate-spin" />
              : <Search size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
            }
            <input
              value={query} onChange={handleQueryChange}
              placeholder="Search by name or email…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#1f2937',
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearchErr('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
                ✕
              </button>
            )}
          </div>

          {searchErr && (
            <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{searchErr}</p>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {results.map(u => (
                <SearchResultRow
                  key={u.id} user={u} busy={busyId === u.id}
                  onSend={() => handleSend(u)}
                  onAccept={() => handleAcceptFromSearch(u)}
                  onDecline={() => onRespond(u.request_id, false)}
                  onOpenRoom={() => onOpenRoom(u.room_id)}
                />
              ))}
            </div>
          )}

          {query.trim() && !searching && results.length === 0 && !searchErr && (
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
              No users found for "{query}".
            </p>
          )}
        </div>
      </div>

      {/* ── Incoming requests ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sectionLabel(`Incoming${incoming.length > 0 ? ` (${incoming.length})` : ''}`)}

        {incoming.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
            <Clock size={16} style={{ color: '#c0d8c0' }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>No incoming requests.</p>
          </div>
        ) : incoming.map(req => {
          const name = req.from_display_name ?? req.from_name ?? req.from_email ?? 'Someone'
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
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{name[0]?.toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>{name}</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>wants to chat</p>
              </div>
              <button onClick={() => onRespond(req.id, true)} style={btnStyle('#0a2a0f', '#dff89a')}>
                <CheckCircle size={12} /> Accept
              </button>
              <button onClick={() => onRespond(req.id, false)} style={btnStyle('transparent', '#dc2626', '1px solid rgba(220,38,38,0.3)')}>
                <XCircle size={12} /> Decline
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Outgoing requests ── */}
      {outgoing.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sectionLabel(`Sent (${outgoing.length})`)}
          {outgoing.map(req => {
            const name = req.to_display_name ?? req.to_name ?? req.to_email ?? 'Someone'
            return (
              <div key={req.id} style={{
                background: 'rgba(255,255,255,0.5)', borderRadius: '14px', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(10,42,15,0.06)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{name[0]?.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>{name}</p>
                </div>
                <span style={{
                  fontSize: '10px', padding: '2px 10px', borderRadius: '999px',
                  background: 'rgba(250,204,21,0.18)', color: '#92400e',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                }}>
                  Pending
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── SearchResultRow ──────────────────────────────────────────────────────────

function SearchResultRow({ user, busy, onSend, onAccept, onDecline, onOpenRoom }) {
  const name = user.display_name ?? (`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email)
  const status = user.relationship_status

  let actionBtn = null
  if (status === 'none') {
    actionBtn = (
      <button onClick={onSend} disabled={busy} style={btnStyle('#0a2a0f', '#dff89a')}>
        {busy ? <Loader2 size={11} className="animate-spin" /> : <UserPlus size={11} />}
        {busy ? 'Sending…' : 'Connect'}
      </button>
    )
  } else if (status === 'outgoing_pending') {
    actionBtn = (
      <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(250,204,21,0.18)', color: '#92400e', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
        Pending
      </span>
    )
  } else if (status === 'incoming_pending') {
    actionBtn = (
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={onAccept} disabled={busy} style={btnStyle('#0a2a0f', '#dff89a')}>
          <CheckCircle size={11} /> Accept
        </button>
        <button onClick={onDecline} disabled={busy} style={btnStyle('transparent', '#dc2626', '1px solid rgba(220,38,38,0.3)')}>
          <XCircle size={11} /> Decline
        </button>
      </div>
    )
  } else if (status === 'connected') {
    actionBtn = (
      <button onClick={onOpenRoom} style={btnStyle('#4a7c59', '#fff')}>
        <MessageCircle size={11} /> Open Chat
      </button>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(255,255,255,0.7)', borderRadius: '12px',
      padding: '10px 12px', border: '1px solid rgba(10,42,15,0.06)',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#4a7c59,#265d34)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#dff89a', fontSize: '12px', fontWeight: 700 }}>{name[0]?.toUpperCase()}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>{name}</p>
        {user.email && (
          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
        )}
      </div>
      {actionBtn}
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function btnStyle(bg, color, border = 'none') {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0,
    padding: '5px 12px', borderRadius: '999px', border,
    background: bg, color, fontSize: '11px', fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
  }
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {[220, null].map((w, i) => (
        <div key={i} style={{
          borderRadius: '16px', background: 'rgba(255,255,255,0.4)',
          width: w ?? '100%', minHeight: '200px', animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}
