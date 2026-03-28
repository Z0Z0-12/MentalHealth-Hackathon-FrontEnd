import { Bell, Lock, Eye, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const sections = [
  {
    title: 'Notifications',
    icon: Bell,
    settings: [
      { label: 'Push notifications',  desc: 'Receive alerts for messages and updates' },
      { label: 'Email notifications', desc: 'Get summaries sent to your email'         },
    ],
  },
  {
    title: 'Privacy',
    icon: Eye,
    settings: [
      { label: 'Profile visibility', desc: 'Control who can see your profile' },
      { label: 'Online status',      desc: 'Show when you are active'          },
    ],
  },
  {
    title: 'Security',
    icon: Lock,
    settings: [
      { label: 'Change password',          desc: 'Update your login credentials'    },
      { label: 'Two-factor authentication', desc: 'Add an extra layer of security'  },
    ],
  },
  {
    title: 'Language & Region',
    icon: Globe,
    settings: [
      { label: 'Language', desc: 'English (default)' },
    ],
  },
]

export default function SettingsPage() {
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
              Settings
            </h1>
          </div>

          {sections.map(section => (
            <div key={section.title} style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)', borderRadius: '20px', overflow: 'hidden' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px', borderBottom: '1px solid rgba(10,42,15,0.07)' }}>
                <section.icon size={15} style={{ color: '#3a6040' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>{section.title}</span>
              </div>

              {section.settings.map((s, i, arr) => (
                <div key={s.label} style={{
                  display:      'flex',
                  alignItems:   'center',
                  padding:      '14px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(10,42,15,0.05)' : 'none',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{s.label}</p>
                    <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 0' }}>{s.desc}</p>
                  </div>
                  {/* Toggle switch */}
                  <div style={{ width: '36px', height: '20px', borderRadius: '999px', background: 'rgba(10,42,15,0.15)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      </main>
    </div>
  )
}