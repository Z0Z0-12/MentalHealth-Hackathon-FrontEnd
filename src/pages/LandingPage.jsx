import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { login, register, loginWithGoogle } = useAuth()

  const [mode, setMode]               = useState('login')
  const [role, setRole]               = useState('student')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [name, setName]               = useState('')
  const [adminSecret, setAdminSecret] = useState('')

  const redirectByRole = (role) => {
    if (role === 'student')         navigate('/dashboard/student')
    else if (role === 'university') navigate('/dashboard/university')
    else                            navigate('/dashboard/admin')
  }

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const me = await login(email, password)
        redirectByRole(me.role)
      } else {
        const payload = { email, password }
        if (role !== 'admin') payload.name = name
        if (role === 'admin') payload.admin_secret = adminSecret
        const me = await register(role, payload)
        if (me?.role) redirectByRole(me.role)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try { await loginWithGoogle() }
    catch (err) { setError(err.message) }
  }

  const roleLabels = { student: 'Student', university: 'University', admin: 'Admin' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          background: linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #071a0b;
        }

        #root { max-width: 100%; padding: 0; text-align: left; }

        .lp-waves {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 0;
          pointer-events: none;
        }
        .lp-waves svg { width: 100%; display: block; }

        .lp-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          z-index: 1;
        }

        /* LEFT */
        .lp-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          min-height: 100vh;
        }

        .lp-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: 22px;
          color: #0a2a0f;
          letter-spacing: -0.5px;
          text-decoration: none;
        }

        .lp-hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 0;
        }

        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(10,42,15,0.1);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          color: #19461f;
          letter-spacing: 0.9px;
          text-transform: uppercase;
          margin-bottom: 28px;
          backdrop-filter: blur(8px);
          width: fit-content;
        }

        .lp-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 58px);
          font-weight: 900;
          line-height: 1.06;
          color: #071a0b;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .lp-headline em { font-style: italic; color: #1a4a20; }

        .lp-sub {
          font-size: 16px;
          color: #2a5230;
          line-height: 1.75;
          max-width: 400px;
          margin-bottom: 40px;
          font-weight: 400;
        }

        .lp-stats { display: flex; gap: 32px; }

        .lp-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 900;
          color: #0a2a0f;
        }

        .lp-stat-label { font-size: 12px; color: #3a6040; margin-top: 2px; }

        /* RIGHT */
        .lp-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          min-height: 100vh;
          border-left: 1px solid rgba(10,42,15,0.08);
        }

        .lp-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.58);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(10,42,15,0.1);
          border-radius: 24px;
          padding: 36px 32px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 900;
          color: #071a0b;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }

        .lp-card-sub {
          font-size: 13px;
          color: #3a6040;
          margin-bottom: 24px;
        }

        /* Role tabs */
        .lp-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 20px;
          background: rgba(10,42,15,0.06);
          padding: 4px;
          border-radius: 14px;
        }

        .lp-tab {
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #3a6040;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .lp-tab.active { background: #0a2a0f; color: #dff89a; }

        /* Fields */
        .lp-field { margin-bottom: 14px; }

        .lp-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #2a5230;
          margin-bottom: 6px;
        }

        .lp-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(10,42,15,0.15);
          border-radius: 12px;
          color: #071a0b;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .lp-input:focus {
          border-color: #0a2a0f;
          box-shadow: 0 0 0 3px rgba(10,42,15,0.08);
        }

        .lp-input::placeholder { color: #7a9a80; }

        .lp-btn-primary {
          width: 100%;
          padding: 13px;
          border-radius: 999px;
          border: none;
          background: #0a2a0f;
          color: #dff89a;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }

        .lp-btn-primary:hover:not(:disabled) {
          background: #143c19;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(10,42,15,0.2);
        }

        .lp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .lp-btn-google {
          width: 100%;
          padding: 11px;
          border-radius: 999px;
          border: 1px solid rgba(10,42,15,0.15);
          background: rgba(255,255,255,0.6);
          color: #0a2a0f;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }

        .lp-btn-google:hover {
          background: rgba(255,255,255,0.85);
          transform: translateY(-1px);
        }

        .lp-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 14px 0 4px;
          color: #5a8060;
          font-size: 12px;
        }

        .lp-divider::before,
        .lp-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(10,42,15,0.1);
        }

        .lp-error {
          background: rgba(220,53,69,0.08);
          border: 1px solid rgba(220,53,69,0.2);
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .lp-toggle {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #3a6040;
        }

        .lp-toggle button {
          background: none;
          border: none;
          color: #0a2a0f;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        @media (max-width: 768px) {
          .lp-page { grid-template-columns: 1fr; }
          .lp-left { display: none; }
          .lp-right { padding: 40px 20px; padding-top: 60px; align-items: flex-start; }
          .lp-card { max-width: 100%; }
        }
      `}</style>

      {/* Waves */}
      <div className="lp-waves">
        <svg viewBox="0 0 1440 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path fill="rgba(140,200,120,0.22)" d="M0,220 C160,155 320,285 480,220 C640,155 800,285 960,220 C1120,155 1280,265 1440,210 L1440,380 L0,380 Z"/>
          <path fill="rgba(100,175,90,0.2)"  d="M0,265 C200,195 400,325 600,265 C800,205 1000,325 1200,268 C1320,238 1390,258 1440,252 L1440,380 L0,380 Z"/>
          <path fill="rgba(70,155,70,0.18)"  d="M0,305 C240,245 480,365 720,305 C960,245 1200,365 1440,305 L1440,380 L0,380 Z"/>
        </svg>
      </div>

      <div className="lp-page">

        {/* LEFT */}
        <div className="lp-left">
          <div className="lp-logo">StudentLife</div>

          <div className="lp-hero-content">
            <div className="lp-eyebrow">✦ Student support platform</div>
            <h1 className="lp-headline">
              You're not alone<br />
              <em>in figuring it out</em>
            </h1>
            <p className="lp-sub">
              Connect with your university community, find internships, access mental health resources, and build your future — all in one place.
            </p>
            <div className="lp-stats">
              <div>
                <div className="lp-stat-num">2.4k+</div>
                <div className="lp-stat-label">Students supported</div>
              </div>
              <div>
                <div className="lp-stat-num">380+</div>
                <div className="lp-stat-label">Universities</div>
              </div>
              <div>
                <div className="lp-stat-num">Free</div>
                <div className="lp-stat-label">Always</div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#5a8060' }}>Built for student wellbeing · 2026</p>
        </div>

        {/* RIGHT */}
        <div className="lp-right">
          <div className="lp-card">
            <h2 className="lp-card-title">
              {mode === 'login' ? 'Welcome back' : 'Join StudentLife'}
            </h2>
            <p className="lp-card-sub">
              {mode === 'login'
                ? 'Sign in to continue to your dashboard.'
                : 'Create your account to get started.'}
            </p>

            {mode === 'register' && (
              <div className="lp-tabs">
                {['student', 'university', 'admin'].map(r => (
                  <button
                    key={r}
                    className={`lp-tab${role === r ? ' active' : ''}`}
                    onClick={() => setRole(r)}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            )}

            {error && <div className="lp-error">{error}</div>}

            {mode === 'register' && role !== 'admin' && (
              <div className="lp-field">
                <label className="lp-label">
                  {role === 'university' ? 'University Name' : 'Full Name'}
                </label>
                <input
                  className="lp-input"
                  type="text"
                  placeholder={role === 'university' ? 'e.g. University of Manchester' : 'e.g. Alex Johnson'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div className="lp-field">
              <label className="lp-label">Email</label>
              <input
                className="lp-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <input
                className="lp-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {mode === 'register' && role === 'admin' && (
              <div className="lp-field">
                <label className="lp-label">Admin Registration Secret</label>
                <input
                  className="lp-input"
                  type="password"
                  placeholder="Enter secret key"
                  value={adminSecret}
                  onChange={e => setAdminSecret(e.target.value)}
                />
              </div>
            )}

            <button
              className="lp-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign In'
                  : `Create ${roleLabels[role]} Account`}
            </button>

            {mode === 'login' && (
              <>
                <div className="lp-divider">or</div>
                <button className="lp-btn-google" onClick={handleGoogle}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <div className="lp-toggle">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => { setMode('register'); setError('') }}>Sign up</button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError('') }}>Sign in</button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
