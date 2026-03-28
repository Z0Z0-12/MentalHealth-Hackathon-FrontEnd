import { useState, useEffect } from 'react'
import { Send, Search, MoreHorizontal } from 'lucide-react'
import { getConversations, getMessages, sendMessage as apiSendMessage } from '../api/chats'

// Placeholder colors for avatars since the API won't return Tailwind classes
const avatarColors = [
  'from-pink-300 to-rose-400',
  'from-blue-300 to-indigo-400',
  'from-purple-300 to-violet-400',
  'from-orange-300 to-amber-400',
  'from-teal-300 to-emerald-400',
]

export default function ChatsTab({ searchQuery = '' }) {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId]           = useState(null)
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  // Load conversation list on mount
  useEffect(() => {
    getConversations()
      .then(data => {
        setConversations(data)
        if (data.length > 0) setActiveId(data[0].id)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeId) return
    getMessages(activeId)
      .then(setMessages)
      .catch(err => setError(err.message))
  }, [activeId])

  async function handleSend() {
    if (!input.trim() || !activeId) return
    const text = input.trim()
    setInput('')
    try {
      const newMsg = await apiSendMessage(activeId, text)
      setMessages(prev => [...prev, newMsg])
      setConversations(prev =>
        prev.map(c => c.id === activeId ? { ...c, lastMessage: text, time: now() } : c)
      )
    } catch (err) {
      setError(err.message)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend()
  }

  function selectConvo(id) {
    setActiveId(id)
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }

  const active = conversations.find(c => c.id === activeId)

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  return (
    <div className="flex w-full gap-4 h-full">

      {/* ── Left sidebar ── */}
      <div className="flex flex-col rounded-2xl overflow-hidden" style={{ width: '280px', minWidth: '280px', background: 'rgba(255,255,255,0.5)' }}>
        <div className="px-4 pt-5 pb-3">
          <h2 className="text-base font-bold text-gray-800 mb-3">Messages</h2>
          <div className="flex items-center gap-2 bg-white/40 rounded-full px-3 py-2">
            <Search size={13} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-xs text-gray-600 outline-none placeholder-gray-400 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((convo, i) => (
            <button
              key={convo.id}
              onClick={() => selectConvo(convo.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeId === convo.id ? 'bg-white/40' : 'hover:bg-white/25'
              }`}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-sm font-semibold">{convo.name?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{convo.name}</span>
                  <span className="text-[10px] text-gray-400">{convo.time}</span>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{convo.lastMessage}</p>
              </div>
              {convo.unread > 0 && (
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">{convo.unread}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right chat panel ── */}
      <div className="flex flex-col flex-1 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.5)' }}>
        {active ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/40">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[conversations.indexOf(active) % avatarColors.length]} flex items-center justify-center`}>
                  <span className="text-white text-sm font-semibold">{active.name?.[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{active.name}</p>
                  <p className="text-[11px] text-green-500">Active now</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[70%] ${
                    msg.from === 'me'
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white/50 text-gray-700 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-white/40 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${active.name}...`}
                className="flex-1 bg-white/40 rounded-full px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors flex-shrink-0"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation
          </div>
        )}
      </div>

    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex w-full gap-4 h-full">
      {[280, null].map((w, i) => (
        <div key={i} className="rounded-2xl animate-pulse" style={{ width: w ?? '100%', background: 'rgba(255,255,255,0.4)' }} />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500">
      <p className="text-sm">Could not connect to the server.</p>
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}