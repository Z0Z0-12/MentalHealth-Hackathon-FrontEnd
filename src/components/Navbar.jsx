import { useState, useRef, useEffect } from 'react'
import { Bell, Grid, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getNotifications, markAllNotificationsRead } from '../api/notifications'
import { useUser } from '../context/UserContext'
import ProfileMenu from './ProfileMenu'

export default function Navbar({ onSearch }) {
  const { user } = useUser()
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [notifOpen, setNotifOpen]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading]   = useState(false)
  const [profileOpen, setProfileOpen]     = useState(false)
  const searchRef = useRef(null)
  const notifRef  = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!notifOpen) return
    setNotifLoading(true)
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false))
  }, [notifOpen])

  function handleSearchChange(e) {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  function clearSearch() {
    setSearchQuery('')
    onSearch?.('')
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead().catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4" style={{ background: 'transparent', position: 'relative', zIndex: 50 }}>
      {/* Logo */}
      <Link to="/" style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 900,
        fontSize: '22px',
        color: '#0a2a0f',
        letterSpacing: '-0.6px',
        textDecoration: 'none',
      }}>
        StudentLife
      </Link>

      {/* Center icons */}
      <div className="flex items-center gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 shadow-sm" style={{ color: '#0a2a0f' }}>
          <Grid size={16} />
        </button>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => setSearchOpen(o => !o)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${searchOpen ? 'bg-white/70 shadow-sm' : 'hover:bg-white/40'}`}
            style={{ color: '#3a6040' }}
          >
            <Search size={16} />
          </button>

          {searchOpen && (
            <div
              className="absolute top-12 left-1/2 -translate-x-1/2 rounded-2xl shadow-lg"
              style={{ width: '280px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(10,42,15,0.1)' }}
            >
              <div className="flex items-center gap-2 px-4 py-3">
                <Search size={14} style={{ color: '#5a8060' }} />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}
                />
                {searchQuery && (
                  <button onClick={clearSearch}>
                    <X size={14} style={{ color: '#5a8060' }} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative ${notifOpen ? 'bg-white/70 shadow-sm' : 'hover:bg-white/40'}`}
            style={{ color: '#3a6040' }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl shadow-lg overflow-hidden"
              style={{ width: '300px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(10,42,15,0.1)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(10,42,15,0.08)' }}>
                <span className="text-sm font-semibold" style={{ color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                  Notifications
                  {unreadCount > 0 && <span className="text-xs font-normal text-red-500 ml-1">({unreadCount} new)</span>}
                </span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs" style={{ color: '#3a6040' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex flex-col max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex flex-col gap-2 p-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: 'rgba(10,42,15,0.06)' }} />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto mb-2" style={{ color: '#c0d8c0' }} />
                    <p className="text-xs" style={{ color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/50 transition-colors"
                      style={{ borderBottom: '1px solid rgba(10,42,15,0.05)' }}
                    >
                      <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.read ? 'transparent' : '#16a34a' }} />
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed" style={{ color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", fontWeight: n.read ? 400 : 600 }}>
                          {n.text}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#5a8060' }}>{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar + Profile Menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setProfileOpen(o => !o)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center hover:ring-2 hover:ring-white/60 transition-all"
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: 'white' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        </button>
        <ProfileMenu open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </nav>
  )
}