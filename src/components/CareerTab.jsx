import { useState, useEffect, useMemo } from 'react'
import {
  MapPin, ExternalLink, Briefcase, Search,
  ChevronDown, ChevronUp, Clock, Tag,
  Loader2, BookOpen, RefreshCw, CheckCircle2,
} from 'lucide-react'
import { getInternships, syncInternships } from '../api/career'

// ─── helpers ─────────────────────────────────────────────────────────────────

function companyInitial(name = '') {
  return (name.trim()[0] ?? '?').toUpperCase()
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (d < 1)  return 'today'
  if (d < 7)  return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

const AVATAR_COLORS = [
  ['#bbf7d0','#166534'], ['#bfdbfe','#1e40af'], ['#fde68a','#92400e'],
  ['#e9d5ff','#5b21b6'], ['#fecaca','#991b1b'], ['#ccfbf1','#134e4a'],
]
function avatarColor(name = '') {
  return AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
}

const PAGE_SIZE = 12

// ─── main component ───────────────────────────────────────────────────────────

export default function CareerTab() {
  const [internships,   setInternships]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [total,         setTotal]         = useState(0)
  const [loadingMore,   setLoadingMore]   = useState(false)

  const [search,        setSearch]        = useState('')

  const [syncing,       setSyncing]       = useState(false)
  const [syncResult,    setSyncResult]    = useState(null)
  const [syncError,     setSyncError]     = useState(null)

  useEffect(() => {
    getInternships(0, PAGE_SIZE)
      .then(data => { setInternships(data?.items ?? []); setTotal(data?.total ?? 0) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    setSyncError(null)
    try {
      const result = await syncInternships()
      setSyncResult(result)
      const data = await getInternships(0, PAGE_SIZE)
      setInternships(data?.items ?? [])
      setTotal(data?.total ?? 0)
    } catch (e) {
      setSyncError(e.message)
    } finally {
      setSyncing(false)
    }
  }

  async function loadMore() {
    setLoadingMore(true)
    try {
      const data = await getInternships(internships.length, PAGE_SIZE)
      setInternships(prev => [...prev, ...(data?.items ?? [])])
      setTotal(data?.total ?? 0)
    } catch { /* silent */ }
    finally { setLoadingMore(false) }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return internships
    return internships.filter(i =>
      i.title?.toLowerCase().includes(q) ||
      i.company?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q) ||
      i.keywords?.some(k => k.toLowerCase().includes(q)) ||
      i.majors?.some(m => m.toLowerCase().includes(q))
    )
  }, [internships, search])

  const hasMore = internships.length < total

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* sync button */}
      <button
        onClick={handleSync}
        disabled={syncing}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: syncing ? 'rgba(10,42,15,0.5)' : '#0a2a0f',
          color: '#dff89a', border: 'none', borderRadius: '12px',
          padding: '10px 16px', fontSize: '12px', fontWeight: 700,
          cursor: syncing ? 'default' : 'pointer',
          fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s ease',
        }}
      >
        {syncing
          ? <><Loader2 size={14} className="animate-spin" /> Syncing internships…</>
          : <><RefreshCw size={14} /> Sync Latest Internships</>
        }
      </button>

      {/* sync result banner */}
      {syncResult && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', borderRadius: '10px', padding: '10px 12px' }}>
          <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#166534', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            Sync complete — <strong>{syncResult.fetched}</strong> fetched,{' '}
            <strong>{syncResult.created}</strong> new,{' '}
            <strong>{syncResult.updated}</strong> updated.
          </p>
        </div>
      )}
      {syncError && (
        <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>
          Sync failed: {syncError}
        </p>
      )}

      {/* search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.6)', borderRadius: '12px',
        padding: '8px 12px', border: '1px solid rgba(0,0,0,0.07)',
      }}>
        <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, company, location, skill…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#1f2937',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>
            ✕
          </button>
        )}
      </div>

      {/* content */}
      {loading ? (
        <LoadingList />
      ) : error ? (
        <ErrorCard message={error} />
      ) : filtered.length === 0 ? (
        <EmptyCard search={search} />
      ) : (
        <>
          <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
            {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : `${total} internship${total !== 1 ? 's' : ''}`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(item => <InternshipCard key={item.id} item={item} />)}
          </div>

          {hasMore && !search && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(10,42,15,0.15)',
                borderRadius: '12px', padding: '10px', fontSize: '12px', fontWeight: 600,
                color: '#3a6040', cursor: loadingMore ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loadingMore ? <><Loader2 size={13} className="animate-spin" /> Loading…</> : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── InternshipCard ───────────────────────────────────────────────────────────

function InternshipCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const [bg, fg]  = avatarColor(item.company)
  const expDays   = daysUntil(item.expires_at)
  const expiring  = expDays !== null && expDays <= 7 && expDays >= 0
  const allTags   = [...(item.keywords ?? []), ...(item.majors ?? [])]
  const visibleTags = expanded ? allTags : allTags.slice(0, 4)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', borderRadius: '16px', padding: '14px',
      border: '1px solid rgba(10,42,15,0.07)', backdropFilter: 'blur(4px)',
    }}>
      {/* top row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: bg, color: fg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px', fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {companyInitial(item.company)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.3 }}>
              {item.title}
            </p>
            {expiring && (
              <span style={{
                flexShrink: 0, fontSize: '10px', fontWeight: 600, padding: '2px 7px',
                background: '#fef3c7', color: '#d97706', borderRadius: '999px',
                display: 'flex', alignItems: 'center', gap: '3px',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <Clock size={9} />
                {expDays === 0 ? 'Expires today' : `${expDays}d left`}
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 0', fontWeight: 600 }}>
            {item.company}
          </p>
        </div>
      </div>

      {/* location + posted */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} style={{ color: '#5a8060' }} />
          <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>{item.location}</span>
        </div>
        <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
          {timeAgo(item.created_at)}
        </span>
      </div>

      {/* tags */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
          {visibleTags.map(tag => (
            <span key={tag} style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
              background: 'rgba(10,42,15,0.06)', color: '#3a6040',
              fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              <Tag size={8} />{tag}
            </span>
          ))}
          {!expanded && allTags.length > 4 && (
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
              background: 'rgba(10,42,15,0.04)', color: '#9ca3af',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              +{allTags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* expanded description */}
      {expanded && item.description && (
        <div style={{ marginTop: '10px', background: 'rgba(10,42,15,0.04)', borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
            <BookOpen size={11} style={{ color: '#5a8060' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#3a6040', fontFamily: "'DM Sans', sans-serif" }}>
              About this role
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: 0 }}>
            {item.description}
          </p>
        </div>
      )}

      {/* footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', background: 'none',
            border: 'none', cursor: 'pointer', color: '#5a8060', fontSize: '11px',
            fontFamily: "'DM Sans', sans-serif", padding: 0,
          }}
        >
          {expanded ? <><ChevronUp size={13} /> Less info</> : <><ChevronDown size={13} /> More info</>}
        </button>
        {item.application_url && (
          <a
            href={item.application_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 700, color: '#fff',
              background: '#0a2a0f', borderRadius: '999px', padding: '6px 14px',
              textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Apply <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── small helpers ────────────────────────────────────────────────────────────

function EmptyCard({ search }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '48px 16px', textAlign: 'center' }}>
      <Briefcase size={28} style={{ color: '#c0d8c0' }} />
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
        {search ? `No results for "${search}".` : 'No internships yet — hit Sync to load the latest.'}
      </p>
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '48px 0' }}>
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>Could not load internships.</p>
      <p style={{ fontSize: '11px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>{message}</p>
    </div>
  )
}

function LoadingList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse" style={{ borderRadius: '16px', height: '100px', background: 'rgba(255,255,255,0.4)' }} />
      ))}
    </div>
  )
}
