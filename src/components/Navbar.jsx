import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import ProfileMenu from './ProfileMenu'

export default function Navbar() {
  const { user } = useUser()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between px-8 py-4" style={{ background: 'transparent', position: 'relative', zIndex: 50 }}>
      {/* Logo */}
      <Link to="/" style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 900,
        fontSize: '28px',
        color: '#0a2a0f',
        letterSpacing: '-0.6px',
        textDecoration: 'none',
      }}>
        Manasly
      </Link>

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