import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { getToken } from '../api/config'
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

export default function AdminDashboard() {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')

  const handleLogout = () => { logout(); navigate('/login') }

  const tabs = [
    { id: 'stats',        label: 'Overview' },
    { id: 'universities', label: 'Universities' },
    { id: 'internships',  label: 'Internships' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ad-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #e8f5e2 0%, #d4efc8 40%, #c2e8b0 100%);
          font-family: 'DM Sans', sans-serif;
          color: #071a0b;
          display: flex;
          flex-direction: column;
        }
        .ad-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 40px;
          background: rgba(255,255,255,0.5); backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(10,42,15,0.1);
          position: sticky; top: 0; z-index: 100;
        }
        .ad-nav-logo { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 20px; color: #0a2a0f; letter-spacing: -0.5px; }
        .ad-nav-logo span {
          font-size: 11px; font-family: 'DM Sans', sans-serif; font-weight: 700;
          background: #0a2a0f; color: #dff89a; padding: 3px 8px; border-radius: 999px;
          margin-left: 10px; letter-spacing: 0.5px; text-transform: uppercase; vertical-align: middle;
        }
        .ad-nav-right { display: flex; align-items: center; gap: 16px; }
        .ad-nav-user { font-size: 13px; color: #2a5230; font-weight: 500; }
        .ad-btn-logout {
          padding: 8px 18px; border-radius: 999px; border: 1.5px solid rgba(10,42,15,0.2);
          background: transparent; color: #0a2a0f; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .ad-btn-logout:hover { background: #0a2a0f; color: #dff89a; }
        .ad-body { display: flex; flex: 1; }
        .ad-sidebar {
          width: 220px; padding: 32px 16px;
          border-right: 1px solid rgba(10,42,15,0.08);
          display: flex; flex-direction: column; gap: 4px;
          background: rgba(255,255,255,0.25); flex-shrink: 0;
        }
        .ad-sidebar-label {
          font-size: 10px; font-weight: 700; color: #5a8060;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 0 12px; margin-bottom: 8px;
        }
        .ad-tab {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 12px; border: none;
          background: transparent; color: #2a5230;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; text-align: left; width: 100%;
        }
        .ad-tab:hover { background: rgba(10,42,15,0.06); }
        .ad-tab.active { background: #0a2a0f; color: #dff89a; font-weight: 700; }
        .ad-main { flex: 1; padding: 36px 40px; overflow-y: auto; }
        .ad-page-title {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900;
          color: #071a0b; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .ad-page-sub { font-size: 13px; color: #3a6040; margin-bottom: 32px; }
        .ad-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
        .ad-stat-card {
          background: rgba(255,255,255,0.58); backdrop-filter: blur(12px);
          border: 1px solid rgba(10,42,15,0.1); border-radius: 20px; padding: 24px 22px;
          animation: fadeUp 0.4s ease both;
        }
        .ad-stat-card:nth-child(2) { animation-delay: 0.07s; }
        .ad-stat-card:nth-child(3) { animation-delay: 0.14s; }
        .ad-stat-card:nth-child(4) { animation-delay: 0.18s; }
        .ad-stat-card:nth-child(5) { animation-delay: 0.22s; }
        .ad-stat-card:nth-child(6) { animation-delay: 0.26s; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ad-stat-icon { font-size: 22px; margin-bottom: 12px; }
        .ad-stat-num { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 900; color: #071a0b; line-height: 1; margin-bottom: 4px; }
        .ad-stat-label { font-size: 12px; color: #5a8060; }
        .ad-section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #071a0b; margin-bottom: 16px; }
        .ad-card {
          background: rgba(255,255,255,0.55); backdrop-filter: blur(12px);
          border: 1px solid rgba(10,42,15,0.1); border-radius: 20px;
          overflow: hidden; animation: fadeUp 0.35s ease both;
        }
        .ad-card-header {
          padding: 20px 24px; border-bottom: 1px solid rgba(10,42,15,0.08);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: left; font-size: 11px; font-weight: 700; color: #5a8060;
          letter-spacing: 0.8px; text-transform: uppercase; padding: 12px 24px;
          background: rgba(10,42,15,0.03); border-bottom: 1px solid rgba(10,42,15,0.07);
        }
        td { padding: 14px 24px; font-size: 13px; color: #2a5230; border-bottom: 1px solid rgba(10,42,15,0.05); vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(10,42,15,0.025); }
        .ad-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .ad-badge-active   { background: rgba(10,42,15,0.1); color: #0a2a0f; }
        .ad-badge-inactive { background: rgba(220,53,69,0.1); color: #b91c1c; }
        .ad-btn {
          padding: 7px 16px; border-radius: 999px; border: 1.5px solid rgba(10,42,15,0.18);
          background: transparent; font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 600; cursor: pointer; transition: all 0.18s; color: #0a2a0f; margin-right: 6px;
        }
        .ad-btn:hover { background: #0a2a0f; color: #dff89a; border-color: #0a2a0f; }
        .ad-btn-danger { border-color: rgba(185,28,28,0.25); color: #b91c1c; }
        .ad-btn-danger:hover { background: #b91c1c; color: #fff; border-color: #b91c1c; }
        .ad-btn-primary {
          padding: 9px 20px; border-radius: 999px; border: none;
          background: #0a2a0f; color: #dff89a; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .ad-btn-primary:hover { background: #143c19; transform: translateY(-1px); }
        .ad-empty { text-align: center; padding: 48px; color: #5a8060; font-size: 14px; }
        .ad-error {
          background: rgba(220,53,69,0.08); border: 1px solid rgba(220,53,69,0.2);
          color: #b91c1c; padding: 16px 20px; border-radius: 16px; font-size: 14px; margin-bottom: 24px;
        }
        .ad-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #3a6040; font-size: 14px; }

        /* Modal */
        .ad-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          backdrop-filter: blur(4px); z-index: 200;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .ad-modal {
          background: rgba(255,255,255,0.95); border-radius: 24px;
          padding: 32px; width: 100%; max-width: 480px;
          border: 1px solid rgba(10,42,15,0.1);
          box-shadow: 0 24px 60px rgba(10,42,15,0.15);
          animation: fadeUp 0.25s ease both;
        }
        .ad-modal-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #071a0b; margin-bottom: 20px; }
        .ad-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .ad-label { font-size: 11px; font-weight: 700; color: #5a8060; text-transform: uppercase; letter-spacing: 0.5px; }
        .ad-input {
          padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(10,42,15,0.15);
          background: rgba(255,255,255,0.8); font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #071a0b; outline: none; width: 100%; transition: border-color 0.2s;
        }
        .ad-input:focus { border-color: #0a2a0f; }
        .ad-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

        @media (max-width: 900px) {
          .ad-stats { grid-template-columns: repeat(2, 1fr); }
          .ad-sidebar { display: none; }
          .ad-main { padding: 24px 20px; }
          .ad-nav { padding: 16px 20px; }
        }
      `}</style>

      <div className="ad-root">
        <nav className="ad-nav">
          <div className="ad-nav-logo">Manasly <span>Admin</span></div>
          <div className="ad-nav-right">
            <span className="ad-nav-user">{user?.email || 'Admin'}</span>
            <button className="ad-btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        <div className="ad-body">
          <aside className="ad-sidebar">
            <div className="ad-sidebar-label">Navigation</div>
           {tabs.map(t => (
              <button key={t.id} className={`ad-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </aside>

          <main className="ad-main">
            {activeTab === 'stats'        && <StatsTab />}
            {activeTab === 'universities' && <UniversitiesTab />}
            {activeTab === 'internships'  && <InternshipsTab />}
          </main>
        </div>
      </div>
    </>
  )
}

/* ── STATS TAB ─────────────────────────────────────────────────────────────── */
function StatsTab() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/dashboard/admin`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="ad-page-title">Overview</div>
      <div className="ad-page-sub">Platform health at a glance — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      {error && <div className="ad-error">{error} — make sure you're logged in as admin and the backend is running.</div>}
      {loading ? <div className="ad-loading">Loading stats…</div> : stats && (
        <>
          <div className="ad-stats">
            {[
              { label: 'Total Students',      value: stats.total_students},
              { label: 'Active Students',     value: stats.active_students},
              { label: 'Total Universities',  value: stats.total_universities },
              { label: 'Active Universities', value: stats.active_universities },
              { label: 'Total Internships',   value: stats.total_internships},
              { label: 'Active Internships',  value: stats.active_internships },
            ].map((s, i) => (
              <div key={i} className="ad-stat-card">
                <div className="ad-stat-icon">{s.icon}</div>
                <div className="ad-stat-num">{s.value ?? 0}</div>
                <div className="ad-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          {stats.recent_universities?.length > 0 && (
            <>
              <div className="ad-section-title">Recent Universities</div>
              <div className="ad-card">
                <table>
                  <thead><tr><th>Name</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recent_universities.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: '#071a0b' }}>{u.name || `University #${i + 1}`}</td>
                        <td><span className="ad-badge ad-badge-active">active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

/* ── UNIVERSITIES TAB ──────────────────────────────────────────────────────── */
function UniversitiesTab() {
  const [unis, setUnis]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null) // null = create, object = edit
  const [form, setForm]       = useState({ name: '', domain: '', description: '' })
  const [saving, setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`${BASE_URL}/api/v1/universities/`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(data => setUnis(data?.items ?? data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', domain: '', description: '' }); setShowModal(true) }
  const openEdit   = (u)  => { setEditing(u);  setForm({ name: u.name || '', domain: u.domain || '', description: u.description || '' }); setShowModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url    = editing ? `${BASE_URL}/api/v1/universities/${editing.id}` : `${BASE_URL}/api/v1/universities/`
      const method = editing ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) })
      if (!res.ok) throw new Error(`${res.status}`)
      setShowModal(false)
      load()
    } catch (e) {
      alert(`Save failed: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this university?')) return
    try {
      const res = await fetch(`${BASE_URL}/api/v1/universities/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error(`${res.status}`)
      load()
    } catch (e) {
      alert(`Delete failed: ${e.message}`)
    }
  }

  return (
    <>
      <div className="ad-page-title">Universities</div>
      <div className="ad-page-sub">Create, edit, and remove universities on the platform.</div>
      {error && <div className="ad-error">⚠️ {error}</div>}

      <div className="ad-card">
        <div className="ad-card-header">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2a0f' }}>{unis.length} universities</div>
          <button className="ad-btn-primary" onClick={openCreate}>+ Add University</button>
        </div>
        {loading ? <div className="ad-loading">Loading…</div> : (
          <table>
            <thead><tr><th>Name</th><th>Domain</th><th>Actions</th></tr></thead>
            <tbody>
              {unis.length === 0 ? (
                <tr><td colSpan={3} className="ad-empty">No universities yet. Add one above.</td></tr>
              ) : unis.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: '#071a0b' }}>{u.name}</td>
                  <td>{u.domain || '—'}</td>
                  <td>
                    <button className="ad-btn" onClick={() => openEdit(u)}>Edit</button>
                    <button className="ad-btn ad-btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="ad-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-title">{editing ? 'Edit University' : 'Add University'}</div>
            <div className="ad-field">
              <label className="ad-label">Name *</label>
              <input className="ad-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. University of Manchester" />
            </div>
            <div className="ad-field">
              <label className="ad-label">Domain</label>
              <input className="ad-input" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} placeholder="e.g. manchester.ac.uk" />
            </div>
            <div className="ad-field">
              <label className="ad-label">Description</label>
              <input className="ad-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description…" />
            </div>
            <div className="ad-modal-actions">
              <button className="ad-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ad-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── INTERNSHIPS TAB ───────────────────────────────────────────────────────── */
function InternshipsTab() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm] = useState({ title: '', company: '', description: '', location: '', application_url: '', majors: '', keywords: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`${BASE_URL}/api/v1/internships/`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(data => setInternships(data?.items ?? data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        majors:   form.majors.split(',').map(s => s.trim()).filter(Boolean),
        keywords: form.keywords.split(',').map(s => s.trim()).filter(Boolean),
        is_active: true,
        source_type: 'manual',
      }
      const res = await fetch(`${BASE_URL}/api/v1/internships/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setShowModal(false)
      setForm({ title: '', company: '', description: '', location: '', application_url: '', majors: '', keywords: '' })
      load()
    } catch (e) {
      alert(`Save failed: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="ad-page-title">Internships</div>
      <div className="ad-page-sub">Post and manage internship listings for students.</div>
      {error && <div className="ad-error">{error}</div>}

      <div className="ad-card">
        <div className="ad-card-header">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2a0f' }}>{internships.length} internships</div>
          <button className="ad-btn-primary" onClick={() => setShowModal(true)}>+ Post Internship</button>
        </div>
        {loading ? <div className="ad-loading">Loading…</div> : (
          <table>
            <thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              {internships.length === 0 ? (
                <tr><td colSpan={4} className="ad-empty">No internships posted yet.</td></tr>
              ) : internships.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600, color: '#071a0b' }}>{i.title}</td>
                  <td>{i.company}</td>
                  <td>{i.location || '—'}</td>
                  <td><span className={`ad-badge ${i.is_active ? 'ad-badge-active' : 'ad-badge-inactive'}`}>{i.is_active ? 'active' : 'inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="ad-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="ad-modal-title">Post Internship</div>
            {[
              { label: 'Title *',          key: 'title',           placeholder: 'e.g. Software Engineer Intern' },
              { label: 'Company *',        key: 'company',         placeholder: 'e.g. Google' },
              { label: 'Location',         key: 'location',        placeholder: 'e.g. London, UK' },
              { label: 'Application URL',  key: 'application_url', placeholder: 'https://...' },
              { label: 'Majors (comma separated)', key: 'majors',  placeholder: 'e.g. Computer Science, Engineering' },
              { label: 'Keywords (comma separated)', key: 'keywords', placeholder: 'e.g. python, machine learning' },
            ].map(f => (
              <div key={f.key} className="ad-field">
                <label className="ad-label">{f.label}</label>
                <input className="ad-input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
            <div className="ad-field">
              <label className="ad-label">Description</label>
              <textarea className="ad-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the role…" style={{ resize: 'vertical' }} />
            </div>
            <div className="ad-modal-actions">
              <button className="ad-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ad-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Posting…' : 'Post Internship'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
