import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { login as apiLogin, registerStudent, getMe, getUniversities } from '../api/auth'

function redirectByRole(roles, navigate) {
  const r = Array.isArray(roles) ? roles : [roles]
  if (r.includes('admin'))           navigate('/dashboard/admin')
  else if (r.includes('university')) navigate('/dashboard/university')
  else                               navigate('/dashboard')
}

export default function LoginPage() {
  const { login, user } = useUser()
  const navigate        = useNavigate()
  const [mode, setMode] = useState('login')

  useEffect(() => {
    if (user) redirectByRole(user.roles, navigate)
  }, [user, navigate])

  return (
    <div style={{
      minHeight:      '100vh',
      background:     'linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px',
      position:       'relative',
    }}>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
          <path fill="rgba(140,200,120,0.22)" d="M0,220 C160,155 320,285 480,220 C640,155 800,285 960,220 C1120,155 1280,265 1440,210 L1440,380 L0,380 Z"/>
          <path fill="rgba(100,175,90,0.2)"   d="M0,265 C200,195 400,325 600,265 C800,205 1000,325 1200,268 C1320,238 1390,258 1440,252 L1440,380 L0,380 Z"/>
          <path fill="rgba(70,155,70,0.18)"   d="M0,305 C240,245 480,365 720,305 C960,245 1200,365 1440,305 L1440,380 L0,380 Z"/>
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        <Link to="/" style={{
          display: 'block', textAlign: 'center',
          fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '26px',
          color: '#0a2a0f', textDecoration: 'none', marginBottom: '28px', letterSpacing: '-0.6px',
        }}>
          StudentLife
        </Link>

        <div style={{
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)',
          borderRadius: '24px', padding: '32px',
          border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 40px rgba(10,42,15,0.08)',
        }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(10,42,15,0.06)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#0a2a0f' : '#5a8060',
                boxShadow: mode === m ? '0 1px 4px rgba(10,42,15,0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {mode === 'login'
            ? <LoginForm    login={login} navigate={navigate} />
            : <RegisterForm login={login} navigate={navigate} />
          }
        </div>
      </div>
    </div>
  )
}

/* ── Login form ── */
function LoginForm({ login, navigate }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiLogin(email, password)
      const me = await getMe()
      login(me)
      redirectByRole(me.roles, navigate)
    } catch (err) {
      setError(err.message.includes('401') ? 'Invalid email or password.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900, color: '#0a2a0f', margin: 0 }}>
        Welcome back
      </h2>
      <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu" required />
      <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
      {error && <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{error}</p>}
      <button type="submit" disabled={loading} style={primaryBtn}>
        {loading ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  )
}

/* ── Register form ── */
function RegisterForm({ login, navigate }) {
  const [universities, setUniversities] = useState([])
  const [univError,    setUnivError]    = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    university_id: '', major: '',
  })
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUniversities()
      .then(data => {
        const items = data?.items ?? []
        setUniversities(items)
        if (items.length === 0) setUnivError(true)
      })
      .catch(() => setUnivError(true))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerStudent({ ...form, skills: [], interests: [] })
      const me = await getMe()
      login(me)
      redirectByRole(me.roles, navigate)
    } catch (err) {
      setError(err.message.includes('422') ? 'Please check all fields.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900, color: '#0a2a0f', margin: 0 }}>
        Join StudentLife
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Field label="First name" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} placeholder="Jane" required />
        <Field label="Last name"  value={form.last_name}  onChange={e => setForm(p => ({ ...p, last_name:  e.target.value }))} placeholder="Doe"  required />
      </div>
      <Field label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@university.edu" required />
      <Field label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" required />
      <Field label="Major" value={form.major} onChange={e => setForm(p => ({ ...p, major: e.target.value }))} placeholder="e.g. Computer Science" required />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>University</label>
        {univError ? (
          <input required value={form.university_id} onChange={e => setForm(p => ({ ...p, university_id: e.target.value }))} placeholder="Enter your university name" style={inputStyle} />
        ) : (
          <select required value={form.university_id} onChange={e => setForm(p => ({ ...p, university_id: e.target.value }))} style={{ ...inputStyle, background: 'rgba(255,255,255,0.7)' }}>
            <option value="">Select your university…</option>
            {universities.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{error}</p>}
      <button type="submit" disabled={loading} style={primaryBtn}>
        {loading ? 'Creating account…' : 'Create account →'}
      </button>
    </form>
  )
}

/* ── Shared field component ── */
function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={inputStyle} />
    </div>
  )
}

const inputStyle = {
  padding: '10px 14px', borderRadius: '12px',
  border: '1px solid rgba(10,42,15,0.15)', background: 'rgba(255,255,255,0.6)',
  fontSize: '13px', color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', width: '100%', boxSizing: 'border-box',
}

const primaryBtn = {
  padding: '12px', borderRadius: '12px', border: 'none',
  background: '#0a2a0f', color: '#dff89a', fontSize: '14px', fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', marginTop: '4px',
  transition: 'background 0.2s ease',
}
