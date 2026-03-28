import { useState, useEffect } from 'react'
import { MapPin, ExternalLink, Briefcase } from 'lucide-react'
import { getInternships, getRecommendations } from '../api/career'
import { useUser } from '../context/UserContext'

export default function CareerTab() {
  const { user } = useUser()
  const [internships,    setInternships]    = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('recommended')

  useEffect(() => {
    setLoading(true)
    const fetches = [
      getInternships(),
      user ? getRecommendations().catch(() => []) : Promise.resolve([]),
    ]
    Promise.all(fetches)
      .then(([internData, recData]) => {
        setInternships(internData?.items ?? [])
        setRecommendations(recData ?? [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  const displayed = tab === 'recommended' && recommendations.length > 0
    ? recommendations
    : internships

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { key: 'recommended', label: 'For You'         },
          { key: 'all',         label: 'All Internships' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily:   "'DM Sans', sans-serif",
              fontSize:     '12px',
              fontWeight:   600,
              padding:      '6px 16px',
              borderRadius: '999px',
              border:       'none',
              cursor:       'pointer',
              background:   tab === t.key ? '#0a2a0f' : 'rgba(255,255,255,0.5)',
              color:        tab === t.key ? '#dff89a' : '#3a6040',
              transition:   'background 0.2s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {displayed.map(item => (
            <InternshipCard
              key={item.id}
              item={item}
              isRec={tab === 'recommended' && recommendations.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InternshipCard({ item, isRec }) {
  const title    = item.internship_title    ?? item.title    ?? '—'
  const company  = item.internship_company  ?? item.company  ?? '—'
  const location = item.internship_location ?? item.location ?? '—'

  return (
    <div style={{
      background:    'rgba(255,255,255,0.6)',
      borderRadius:  '16px',
      padding:       '16px',
      display:       'flex',
      flexDirection: 'column',
      gap:           '8px',
      border:        '1px solid rgba(10,42,15,0.07)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.3 }}>
            {title}
          </p>
          <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 0' }}>
            {company}
          </p>
        </div>
        {isRec && item.score != null && (
          <span style={{
            fontSize: '10px', fontWeight: 700, flexShrink: 0,
            background: 'rgba(22,163,74,0.1)', color: '#16a34a',
            borderRadius: '999px', padding: '3px 8px',
          }}>
            {Math.round(item.score * 100)}% match
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPin size={11} style={{ color: '#5a8060', flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
          {location}
        </span>
      </div>

      {isRec && item.reason && (
        <p style={{ fontSize: '11px', color: '#3a6040', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, margin: 0 }}>
          {item.reason}
        </p>
      )}

      <a
        href={item.application_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop:      'auto',
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '4px',
          fontSize:       '11px',
          fontWeight:     600,
          color:          '#0a2a0f',
          background:     'rgba(10,42,15,0.07)',
          borderRadius:   '999px',
          padding:        '5px 12px',
          textDecoration: 'none',
          width:          'fit-content',
          transition:     'background 0.2s ease',
        }}
      >
        Apply <ExternalLink size={10} />
      </a>
    </div>
  )
}

function EmptyState({ tab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <Briefcase size={32} style={{ color: '#c0d8c0' }} />
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
        {tab === 'recommended'
          ? 'No recommendations yet — complete your profile to get matched!'
          : 'No internships listed yet.'}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ borderRadius: '16px', height: '128px', background: 'rgba(255,255,255,0.4)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>Could not load internships.</p>
      <p style={{ fontSize: '11px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>{message}</p>
    </div>
  )
}