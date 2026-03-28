import { useState } from 'react'
import { User, Mail, Phone, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useUser } from '../context/UserContext'
import { updateMe } from '../api/auth'

export default function AccountPage() {
  const { user, updateUser } = useUser()
  const [editing, setEditing] = useState(null)   // field label being edited
  const [draft, setDraft]     = useState('')
  const [saving, setSaving]   = useState(false)

  const fields = [
    { icon: User,     label: 'Full name',   key: 'name',   value: user?.name   ?? 'Not set' },
    { icon: Mail,     label: 'Email',       key: 'email',  value: user?.email  ?? 'Not set' },
    { icon: Phone,    label: 'Phone',       key: 'phone',  value: user?.phone  ?? 'Not set' },
    { icon: Calendar, label: 'Date joined', key: null,     value: user?.joined ?? 'March 2026' },
  ]

  function startEdit(field) {
    if (!field.key) return
    setEditing(field.label)
    setDraft(field.value === 'Not set' ? '' : field.value)
  }

  async function saveEdit(field) {
    if (!field.key) return
    setSaving(true)
    try {
      const updated = await updateMe({ [field.key]: draft })
      updateUser(updated ?? { [field.key]: draft })
    } catch {
      updateUser({ [field.key]: draft })
    } finally {
      setSaving(false)
      setEditing(null)
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{
      background: 'linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%)',
      position: 'relative',
    }}>
      {/* Waves */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
          <path fill="rgba(140,200,120,0.22)" d="M0,220 C160,155 320,285 480,220 C640,155 800,285 960,220 C1120,155 1280,265 1440,210 L1440,380 L0,380 Z"/>
          <path fill="rgba(100,175,90,0.2)"  d="M0,265 C200,195 400,325 600,265 C800,205 1000,325 1200,268 C1320,238 1390,258 1440,252 L1440,380 L0,380 Z"/>
          <path fill="rgba(70,155,70,0.18)"  d="M0,305 C240,245 480,365 720,305 C960,245 1200,365 1440,305 L1440,380 L0,380 Z"/>
        </svg>
      </div>

      <Navbar />

      <main className="flex-1 overflow-y-auto px-6 py-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Header */}
          <div>
            <Link to="/dashboard" style={{ fontSize: '12px', color: '#5a8060', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              ← Back to dashboard
            </Link>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#0a2a0f', marginTop: '8px', fontWeight: 900 }}>
              My Account
            </h1>
          </div>

          {/* Avatar card */}
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                {user?.name ?? 'Student User'}
              </p>
              <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 12px' }}>
                {user?.role ?? 'Student'} · Member since {user?.joined ?? 'March 2026'}
              </p>
              <button style={{ fontSize: '12px', fontWeight: 600, color: '#0a2a0f', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(10,42,15,0.15)', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                Change photo
              </button>
            </div>
          </div>

          {/* Info fields */}
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', borderRadius: '20px', padding: '8px' }}>
            {fields.map((field, i, arr) => (
              <div key={field.label} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '14px',
                padding:      '14px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(10,42,15,0.07)' : 'none',
              }}>
                <field.icon size={16} style={{ color: '#5a8060', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{field.label}</p>
                  {editing === field.label ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(field); if (e.key === 'Escape') setEditing(null) }}
                      style={{
                        fontSize: '14px', color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                        marginTop: '2px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(10,42,15,0.2)',
                        borderRadius: '8px', padding: '4px 8px', outline: 'none', width: '100%',
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '14px', color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, margin: '2px 0 0' }}>
                      {field.value}
                    </p>
                  )}
                </div>
                {field.key && (
                  editing === field.label ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => saveEdit(field)}
                        disabled={saving}
                        style={{ fontSize: '12px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        style={{ fontSize: '12px', color: '#5a8060', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(field)}
                      style={{ fontSize: '12px', color: '#3a6040', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                    >
                      Edit
                    </button>
                  )
                )}
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}