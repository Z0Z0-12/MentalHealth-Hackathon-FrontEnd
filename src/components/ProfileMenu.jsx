import { useRef, useEffect } from 'react'
import { User, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { logout as apiLogout } from '../api/auth'

const menuItems = [
  { icon: User,       label: 'Account',  path: '/account'  },
  { icon: Settings,   label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help',     path: null        },
]

export default function ProfileMenu({ open, onClose }) {
  const ref             = useRef(null)
  const navigate        = useNavigate()
  const { user, logout } = useUser()

  async function handleLogout() {
    await apiLogout().catch(() => {})
    logout()
    navigate('/')
    onClose()
  }

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={ref} style={{
      position:        'absolute',
      top:             '48px',
      right:           0,
      width:           '200px',
      borderRadius:    '16px',
      overflow:        'hidden',
      background:      'rgba(255,255,255,0.88)',
      backdropFilter:  'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border:          '1px solid rgba(10,42,15,0.1)',
      boxShadow:       '0 8px 32px rgba(10,42,15,0.1)',
      zIndex:          100,
    }}>
      {/* Profile header */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(10,42,15,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #f97316, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            {user?.name ?? 'My Profile'}
          </p>
          <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            {user?.role ?? 'Student'}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: '6px' }}>
        {menuItems.map(item => (
          <button key={item.label} onClick={() => { if (item.path) { navigate(item.path); onClose() } }} style={{
            width:          '100%',
            display:        'flex',
            alignItems:     'center',
            gap:            '10px',
            padding:        '10px 12px',
            borderRadius:   '10px',
            border:         'none',
            background:     'transparent',
            cursor:         'pointer',
            transition:     'background 0.15s ease',
            fontFamily:     "'DM Sans', sans-serif",
            fontSize:       '13px',
            fontWeight:     500,
            color:          '#0a2a0f',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,42,15,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <item.icon size={15} style={{ color: '#3a6040', flexShrink: 0 }} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '6px', borderTop: '1px solid rgba(10,42,15,0.08)' }}>
        <button onClick={handleLogout} style={{
          width:        '100%',
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '10px 12px',
          borderRadius: '10px',
          border:       'none',
          background:   'transparent',
          cursor:       'pointer',
          transition:   'background 0.15s ease',
          fontFamily:   "'DM Sans', sans-serif",
          fontSize:     '13px',
          fontWeight:   500,
          color:        '#dc2626',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={15} style={{ color: '#dc2626', flexShrink: 0 }} />
          Log out
        </button>
      </div>
    </div>
  )
}