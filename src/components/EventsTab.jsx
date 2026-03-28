import { useState, useEffect } from 'react'
import { Calendar, MapPin, Video, Users } from 'lucide-react'
import { getEvents, rsvpEvent, cancelRsvp } from '../api/events'

export default function EventsTab() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data?.items ?? data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function toggleRsvp(event) {
    try {
      if (event.my_rsvp_status === 'attending') {
        await cancelRsvp(event.id)
        setEvents(prev => prev.map(e => e.id === event.id
          ? { ...e, my_rsvp_status: null, rsvp_count: e.rsvp_count - 1 }
          : e
        ))
      } else {
        await rsvpEvent(event.id)
        setEvents(prev => prev.map(e => e.id === event.id
          ? { ...e, my_rsvp_status: 'attending', rsvp_count: e.rsvp_count + 1 }
          : e
        ))
      }
    } catch {
      // silently fail — RSVP is a nice-to-have
    }
  }

  if (loading) return <LoadingState />
  if (error)   return <ErrorState message={error} />

  if (events.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <Calendar size={32} style={{ color: '#c0d8c0' }} />
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>No upcoming events yet.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {events.map(event => (
        <EventCard key={event.id} event={event} onToggleRsvp={toggleRsvp} />
      ))}
    </div>
  )
}

function EventCard({ event, onToggleRsvp }) {
  const isOnline   = event.mode === 'online' || event.mode === 'virtual'
  const attending  = event.my_rsvp_status === 'attending'
  const start      = event.start_at ? new Date(event.start_at) : null
  const dateStr    = start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const timeStr    = start ? start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div style={{
      background:    'rgba(255,255,255,0.6)',
      borderRadius:  '16px',
      padding:       '16px',
      display:       'flex',
      gap:           '16px',
      border:        '1px solid rgba(10,42,15,0.07)',
    }}>
      {/* Date block */}
      <div style={{
        flexShrink:     0,
        width:          '52px',
        background:     'linear-gradient(135deg, #0a2a0f, #1a4a20)',
        borderRadius:   '12px',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '8px 4px',
      }}>
        <span style={{ fontSize: '10px', color: '#a0d8a0', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase' }}>
          {start ? start.toLocaleDateString('en-US', { month: 'short' }) : '—'}
        </span>
        <span style={{ fontSize: '22px', color: 'white', fontFamily: "'Playfair Display', serif", fontWeight: 900, lineHeight: 1 }}>
          {start ? start.getDate() : '—'}
        </span>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          {event.title}
        </p>
        <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", margin: '2px 0 8px' }}>
          {event.organizer_name} · {dateStr} at {timeStr}
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isOnline
              ? <Video size={11} style={{ color: '#5a8060' }} />
              : <MapPin size={11} style={{ color: '#5a8060' }} />
            }
            <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
              {isOnline ? 'Online' : (event.location ?? 'TBD')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={11} style={{ color: '#5a8060' }} />
            <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
              {event.rsvp_count ?? 0} attending
            </span>
          </div>
        </div>
      </div>

      {/* RSVP button */}
      <button
        onClick={() => onToggleRsvp(event)}
        style={{
          flexShrink:   0,
          alignSelf:    'center',
          padding:      '7px 14px',
          borderRadius: '999px',
          border:       attending ? 'none' : '1px solid rgba(10,42,15,0.2)',
          background:   attending ? '#0a2a0f' : 'transparent',
          color:        attending ? '#dff89a' : '#3a6040',
          fontSize:     '11px',
          fontWeight:   700,
          fontFamily:   "'DM Sans', sans-serif",
          cursor:       'pointer',
          transition:   'all 0.2s ease',
        }}
      >
        {attending ? 'Going ✓' : 'RSVP'}
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ borderRadius: '16px', height: '90px', background: 'rgba(255,255,255,0.4)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '48px 0' }}>
      <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>Could not load events.</p>
      <p style={{ fontSize: '11px', color: '#9ab09a', fontFamily: "'DM Sans', sans-serif" }}>{message}</p>
    </div>
  )
}