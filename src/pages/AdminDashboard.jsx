import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { getToken } from '../api/config'
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AdminDashboard() {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeTab, setActiveTab] = useState('stats')

  const handleLogout = () => { logout(); navigate('/login') }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/dashboard/admin`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) throw new Error(`Failed to load stats (${res.status})`)
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const tabs = [
    { id: 'stats',        label: 'Overview',      icon: '📊' },
    { id: 'universities', label: 'Universities',  icon: '🏛️' },
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 40px;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(10,42,15,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .ad-nav-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: 20px;
          color: #0a2a0f;
          letter-spacing: -0.5px;
        }

        .ad-nav-logo span {
          font-size: 11px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          background: #0a2a0f;
          color: #dff89a;
          padding: 3px 8px;
          border-radius: 999px;
          margin-left: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          vertical-align: middle;
        }

        .ad-nav-right { display: flex; align-items: center; gap: 16px; }

        .ad-nav-user { font-size: 13px; color: #2a5230; font-weight: 500; }

        .ad-btn-logout {
          padding: 8px 18px;
          border-radius: 999px;
          border: 1.5px solid rgba(10,42,15,0.2);
          background: transparent;
          color: #0a2a0f;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ad-btn-logout:hover { background: #0a2a0f; color: #dff89a; }

        .ad-body { display: flex; flex: 1; }

        .ad-sidebar {
          width: 220px;
          padding: 32px 16px;
          border-right: 1px solid rgba(10,42,15,0.08);
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }

        .ad-sidebar-label {
          font-size: 10px;
          font-weight: 700;
          color: #5a8060;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .ad-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #2a5230;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }

        .ad-tab:hover { background: rgba(10,42,15,0.06); }
        .ad-tab.active { background: #0a2a0f; color: #dff89a; font-weight: 700; }

        .ad-main { flex: 1; padding: 36px 40px; overflow-y: auto; }

        .ad-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: #071a0b;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .ad-page-sub { font-size: 13px; color: #3a6040; margin-bottom: 32px; }

        .ad-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 36px;
        }

        .ad-stat-card {
          background: rgba(255,255,255,0.58);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(10,42,15,0.1);
          border-radius: 20px;
          padding: 24px 22px;
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

        .ad-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 900;
          color: #071a0b;
          line-height: 1;
          margin-bottom: 4px;
        }

        .ad-stat-label { font-size: 12px; color: #5a8060; }

        .ad-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #071a0b;
          margin-bottom: 16px;
        }

        .ad-card {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(10,42,15,0.1);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeUp 0.35s ease both;
        }

        table { width: 100%; border-collapse: collapse; }

        th {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #5a8060;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          padding: 12px 24px;
          background: rgba(10,42,15,0.03);
          border-bottom: 1px solid rgba(10,42,15,0.07);
        }

        td {
          padding: 14px 24px;
          font-size: 13px;
          color: #2a5230;
          border-bottom: 1px solid rgba(10,42,15,0.05);
          vertical-align: middle;
        }

        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(10,42,15,0.025); }

        .ad-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .ad-badge-active { background: rgba(10,42,15,0.1); color: #0a2a0f; }

        .ad-empty { text-align: center; padding: 48px; color: #5a8060; font-size: 14px; }

        .ad-error {
          background: rgba(220,53,69,0.08);
          border: 1px solid rgba(220,53,69,0.2);
          color: #b91c1c;
          padding: 16px 20px;
          border-radius: 16px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .ad-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #3a6040;
          font-size: 14px;
        }

        @media (max-width: 900px) {
          .ad-stats { grid-template-columns: repeat(2, 1fr); }
          .ad-sidebar { display: none; }
          .ad-main { padding: 24px 20px; }
          .ad-nav { padding: 16px 20px; }
        }
      `}</style>

      <div className="ad-root">

        <nav className="ad-nav">
          <div className="ad-nav-logo">
            StudentLife <span>Admin</span>
          </div>
          <div className="ad-nav-right">
            <span className="ad-nav-user">👋 {user?.email || 'Admin'}</span>
            <button className="ad-btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        <div className="ad-body">

          <aside className="ad-sidebar">
            <div className="ad-sidebar-label">Navigation</div>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`ad-tab${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </aside>

          <main className="ad-main">

            {/* ── OVERVIEW ── */}
            {activeTab === 'stats' && (
              <>
                <div className="ad-page-title">Overview</div>
                <div className="ad-page-sub">
                  Platform health at a glance — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {error && <div className="ad-error">⚠️ {error} — make sure you're logged in as admin and the backend is running.</div>}

                {loading ? (
                  <div className="ad-loading">Loading stats…</div>
                ) : stats && (
                  <>
                    <div className="ad-stats">
                      {[
                        { label: 'Total Students',      value: stats.total_students,      icon: '🎓' },
                        { label: 'Active Students',     value: stats.active_students,     icon: '✅' },
                        { label: 'Total Universities',  value: stats.total_universities,  icon: '🏛️' },
                        { label: 'Active Universities', value: stats.active_universities, icon: '🟢' },
                        { label: 'Total Internships',   value: stats.total_internships,   icon: '💼' },
                        { label: 'Active Internships',  value: stats.active_internships,  icon: '📋' },
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
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recent_universities.map((u, i) => (
                                <tr key={i}>
                                  <td style={{ fontWeight: 600, color: '#071a0b' }}>
                                    {u.name || u.email || `University #${i + 1}`}
                                  </td>
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
            )}

            {/* ── UNIVERSITIES ── */}
            {activeTab === 'universities' && (
              <>
                <div className="ad-page-title">Universities</div>
                <div className="ad-page-sub">Recently registered universities on the platform.</div>

                {loading ? (
                  <div className="ad-loading">Loading…</div>
                ) : (
                  <div className="ad-card">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!stats?.recent_universities?.length ? (
                          <tr><td colSpan={2} className="ad-empty">No universities registered yet.</td></tr>
                        ) : stats.recent_universities.map((u, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, color: '#071a0b' }}>
                              {u.name || u.email || `University #${i + 1}`}
                            </td>
                            <td><span className="ad-badge ad-badge-active">active</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </>
  )
}
