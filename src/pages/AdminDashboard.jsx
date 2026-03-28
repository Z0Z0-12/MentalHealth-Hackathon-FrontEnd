import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ── Mock data (replace with real API calls later) ─────────────────────────────
const MOCK_USERS = [
  { id: 1, name: 'Alex Johnson', email: 'alex@uni.edu', role: 'student', status: 'active', joined: '2026-01-12' },
  { id: 2, name: 'University of Manchester', email: 'admin@manchester.ac.uk', role: 'university', status: 'active', joined: '2026-01-08' },
  { id: 3, name: 'Sara Lee', email: 'sara@gmail.com', role: 'student', status: 'banned', joined: '2026-02-01' },
  { id: 4, name: 'Tech Institute', email: 'info@techinst.edu', role: 'university', status: 'active', joined: '2026-02-14' },
  { id: 5, name: 'James Wright', email: 'james@uni.edu', role: 'student', status: 'active', joined: '2026-03-01' },
]

const MOCK_APPROVALS = [
  { id: 1, name: 'Oxford Brookes University', email: 'contact@brookes.ac.uk', submitted: '2026-03-20', docs: 'verified' },
  { id: 2, name: 'Northampton College', email: 'admin@northampton.edu', submitted: '2026-03-22', docs: 'pending' },
  { id: 3, name: 'Meridian Business School', email: 'hello@meridian.edu', submitted: '2026-03-25', docs: 'verified' },
]

const MOCK_REPORTS = [
  { id: 1, type: 'Inappropriate content', reporter: 'alex@uni.edu', target: 'Post #482', date: '2026-03-26', status: 'open' },
  { id: 2, type: 'Spam', reporter: 'james@uni.edu', target: 'User sara@gmail.com', date: '2026-03-25', status: 'resolved' },
  { id: 3, type: 'Harassment', reporter: 'contact@brookes.ac.uk', target: 'User #19', date: '2026-03-27', status: 'open' },
]

const STATS = [
  { label: 'Total Users', value: '2,418', delta: '+12%', icon: '👥' },
  { label: 'Universities', value: '384', delta: '+3', icon: '🏛️' },
  { label: 'Open Reports', value: '7', delta: '-2', icon: '🚩' },
  { label: 'Pending Approvals', value: '3', delta: 'new', icon: '⏳' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [users, setUsers] = useState(MOCK_USERS)
  const [approvals, setApprovals] = useState(MOCK_APPROVALS)
  const [reports, setReports] = useState(MOCK_REPORTS)
  const [search, setSearch] = useState('')

  const handleLogout = () => { logout(); navigate('/login') }

  const toggleBan = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u
    ))
  }

  const approveUniversity = (id) => setApprovals(prev => prev.filter(a => a.id !== id))
  const rejectUniversity  = (id) => setApprovals(prev => prev.filter(a => a.id !== id))
  const resolveReport     = (id) => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r))

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = [
    { id: 'stats',     label: 'Overview'},
    { id: 'users',     label: 'Users'},
    { id: 'approvals', label: 'Approvals'},
    { id: 'reports',   label: 'Reports' },
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

        /* ── Top Nav ── */
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

        .ad-nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ad-nav-user {
          font-size: 13px;
          color: #2a5230;
          font-weight: 500;
        }

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

        .ad-btn-logout:hover {
          background: #0a2a0f;
          color: #dff89a;
        }

        /* ── Layout ── */
        .ad-body {
          display: flex;
          flex: 1;
        }

        /* ── Sidebar ── */
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

        .ad-tab.active {
          background: #0a2a0f;
          color: #dff89a;
          font-weight: 700;
        }

        .ad-tab-icon { font-size: 16px; }

        /* ── Main ── */
        .ad-main {
          flex: 1;
          padding: 36px 40px;
          overflow-y: auto;
        }

        .ad-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: #071a0b;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .ad-page-sub {
          font-size: 13px;
          color: #3a6040;
          margin-bottom: 32px;
        }

        /* ── Stats Grid ── */
        .ad-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
        .ad-stat-card:nth-child(4) { animation-delay: 0.21s; }

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

        .ad-stat-label { font-size: 12px; color: #5a8060; margin-bottom: 8px; }

        .ad-stat-delta {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #19461f;
          background: rgba(10,42,15,0.08);
          padding: 2px 8px;
          border-radius: 999px;
        }

        /* ── Activity Feed ── */
        .ad-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #071a0b;
          margin-bottom: 16px;
        }

        .ad-activity {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(10,42,15,0.09);
          border-radius: 20px;
          overflow: hidden;
        }

        .ad-activity-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 22px;
          border-bottom: 1px solid rgba(10,42,15,0.06);
          font-size: 13px;
          color: #2a5230;
          transition: background 0.15s;
        }

        .ad-activity-row:last-child { border-bottom: none; }
        .ad-activity-row:hover { background: rgba(10,42,15,0.03); }

        .ad-activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0a2a0f;
          flex-shrink: 0;
        }

        /* ── Table ── */
        .ad-card {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(10,42,15,0.1);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeUp 0.35s ease both;
        }

        .ad-card-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(10,42,15,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .ad-search {
          padding: 9px 14px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(10,42,15,0.15);
          border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #071a0b;
          outline: none;
          width: 220px;
          transition: border-color 0.2s;
        }

        .ad-search:focus { border-color: #0a2a0f; }
        .ad-search::placeholder { color: #7a9a80; }

        table {
          width: 100%;
          border-collapse: collapse;
        }

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
          letter-spacing: 0.3px;
        }

        .ad-badge-active   { background: rgba(10,42,15,0.1);  color: #0a2a0f; }
        .ad-badge-banned   { background: rgba(220,53,69,0.1); color: #b91c1c; }
        .ad-badge-student  { background: rgba(10,42,15,0.07); color: #2a5230; }
        .ad-badge-university { background: rgba(100,149,237,0.12); color: #1a3a8a; }
        .ad-badge-open     { background: rgba(220,53,69,0.1); color: #b91c1c; }
        .ad-badge-resolved { background: rgba(10,42,15,0.1);  color: #0a2a0f; }
        .ad-badge-verified { background: rgba(10,42,15,0.1);  color: #0a2a0f; }
        .ad-badge-pending  { background: rgba(234,179,8,0.12); color: #854d0e; }

        .ad-btn-action {
          padding: 6px 14px;
          border-radius: 999px;
          border: 1.5px solid rgba(10,42,15,0.18);
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          color: #0a2a0f;
          margin-right: 6px;
        }

        .ad-btn-action:hover {
          background: #0a2a0f;
          color: #dff89a;
          border-color: #0a2a0f;
        }

        .ad-btn-danger {
          border-color: rgba(185,28,28,0.25);
          color: #b91c1c;
        }

        .ad-btn-danger:hover {
          background: #b91c1c;
          color: #fff;
          border-color: #b91c1c;
        }

        .ad-empty {
          text-align: center;
          padding: 48px;
          color: #5a8060;
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

        {/* Nav */}
        <nav className="ad-nav">
          <div className="ad-nav-logo">
            StudentLife
            <span>Admin</span>
          </div>
          <div className="ad-nav-right">
            <span className="ad-nav-user">👋 {user?.email || 'Admin'}</span>
            <button className="ad-btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        <div className="ad-body">

          {/* Sidebar */}
          <aside className="ad-sidebar">
            <div className="ad-sidebar-label">Navigation</div>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`ad-tab${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="ad-tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </aside>

          {/* Main */}
          <main className="ad-main">

            {/* ── OVERVIEW ── */}
            {activeTab === 'stats' && (
              <>
                <div className="ad-page-title">Overview</div>
                <div className="ad-page-sub">Platform health at a glance — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>

                <div className="ad-stats">
                  {STATS.map(s => (
                    <div key={s.label} className="ad-stat-card">
                      <div className="ad-stat-icon">{s.icon}</div>
                      <div className="ad-stat-num">{s.value}</div>
                      <div className="ad-stat-label">{s.label}</div>
                      <div className="ad-stat-delta">{s.delta} this month</div>
                    </div>
                  ))}
                </div>

                <div className="ad-section-title">Recent Activity</div>
                <div className="ad-activity">
                  {[
                    { text: 'New university registration: Meridian Business School', time: '2h ago' },
                    { text: 'Report resolved: Spam by james@uni.edu', time: '5h ago' },
                    { text: 'User banned: sara@gmail.com', time: '1d ago' },
                    { text: 'University approved: Tech Institute', time: '2d ago' },
                    { text: 'New report filed: Harassment on User #19', time: '3h ago' },
                  ].map((a, i) => (
                    <div key={i} className="ad-activity-row">
                      <div className="ad-activity-dot" />
                      <span style={{ flex: 1 }}>{a.text}</span>
                      <span style={{ fontSize: '11px', color: '#7a9a80' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── USERS ── */}
            {activeTab === 'users' && (
              <>
                <div className="ad-page-title">User Management</div>
                <div className="ad-page-sub">Search, review, and manage all platform users.</div>

                <div className="ad-card">
                  <div className="ad-card-header">
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0a2a0f' }}>{filteredUsers.length} users</div>
                    <input
                      className="ad-search"
                      placeholder="Search by name or email…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={6} className="ad-empty">No users found.</td></tr>
                      ) : filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600, color: '#071a0b' }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className={`ad-badge ad-badge-${u.role}`}>{u.role}</span></td>
                          <td><span className={`ad-badge ad-badge-${u.status}`}>{u.status}</span></td>
                          <td>{u.joined}</td>
                          <td>
                            <button
                              className={`ad-btn-action ${u.status === 'banned' ? '' : 'ad-btn-danger'}`}
                              onClick={() => toggleBan(u.id)}
                            >
                              {u.status === 'banned' ? 'Unban' : 'Ban'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── APPROVALS ── */}
            {activeTab === 'approvals' && (
              <>
                <div className="ad-page-title">University Approvals</div>
                <div className="ad-page-sub">Review and approve new university registrations.</div>

                <div className="ad-card">
                  <table>
                    <thead>
                      <tr>
                        <th>University</th>
                        <th>Email</th>
                        <th>Submitted</th>
                        <th>Docs</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.length === 0 ? (
                        <tr><td colSpan={5} className="ad-empty">✅ No pending approvals.</td></tr>
                      ) : approvals.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600, color: '#071a0b' }}>{a.name}</td>
                          <td>{a.email}</td>
                          <td>{a.submitted}</td>
                          <td><span className={`ad-badge ad-badge-${a.docs}`}>{a.docs}</span></td>
                          <td>
                            <button className="ad-btn-action" onClick={() => approveUniversity(a.id)}>Approve</button>
                            <button className="ad-btn-action ad-btn-danger" onClick={() => rejectUniversity(a.id)}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── REPORTS ── */}
            {activeTab === 'reports' && (
              <>
                <div className="ad-page-title">Reports & Flagged Content</div>
                <div className="ad-page-sub">Review user-submitted reports and take action.</div>

                <div className="ad-card">
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Reporter</th>
                        <th>Target</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: '#071a0b' }}>{r.type}</td>
                          <td>{r.reporter}</td>
                          <td>{r.target}</td>
                          <td>{r.date}</td>
                          <td><span className={`ad-badge ad-badge-${r.status}`}>{r.status}</span></td>
                          <td>
                            {r.status === 'open' && (
                              <button className="ad-btn-action" onClick={() => resolveReport(r.id)}>
                                Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  )
}
