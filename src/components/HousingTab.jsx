import { useState, useEffect } from 'react'
import { MapPin, Home, DollarSign, BedDouble } from 'lucide-react'
import { getApartments } from '../api/housing'

export default function HousingTab() {
  const [apartments, setApartments] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    getApartments()
      .then(data => setApartments(data?.items ?? data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  if (apartments.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <Home size={32} style={{ color: '#c0d8c0' }} />
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>No apartments listed yet.</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {apartments.map(apt => (
        <ApartmentCard key={apt.id} apt={apt} />
      ))}
    </div>
  )
}

function ApartmentCard({ apt }) {
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
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
        {apt.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPin size={11} style={{ color: '#5a8060' }} />
        <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
          {apt.city}{apt.state ? `, ${apt.state}` : ''}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarSign size={11} style={{ color: '#5a8060' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a', fontFamily: "'DM Sans', sans-serif" }}>
            ${apt.monthly_rent?.toLocaleString()}/mo
          </span>
        </div>
        {apt.bedrooms != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BedDouble size={11} style={{ color: '#5a8060' }} />
            <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
              {apt.bedrooms} bed{apt.bedrooms !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {apt.is_furnished && (
          <span style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderRadius: '999px', padding: '2px 8px' }}>
            Furnished
          </span>
        )}
      </div>

      {apt.description && (
        <p style={{ fontSize: '11px', color: '#3a6040', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, margin: 0 }}>
          {apt.description.length > 100 ? apt.description.slice(0, 100) + '…' : apt.description}
        </p>
      )}

      <a
        href={`mailto:${apt.contact_email}`}
        style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#0a2a0f', background: 'rgba(10,42,15,0.07)', borderRadius: '999px', padding: '5px 12px', textDecoration: 'none', width: 'fit-content' }}
      >
        Contact
      </a>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ borderRadius: '16px', height: '140px', background: 'rgba(255,255,255,0.4)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>Could not load apartments.</p>
      <p style={{ fontSize: '11px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>{message}</p>
    </div>
  )
}