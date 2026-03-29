import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  MapPin, Video, Users, Plus, X,
  Calendar, Clock, Tag, ExternalLink, LayoutList, Edit3, Loader2,
} from 'lucide-react'
import {
  getEvents, createEvent, updateEvent,
  rsvpEvent, cancelRsvp,
} from '../api/events'
import { useUser } from '../context/UserContext'

// ─── helpers ─────────────────────────────────────────────────────────────────

const MODES = ['virtual', 'in_person', 'hybrid']

const MODE_STYLE = {
  virtual:   { bg: '#e8f4ff', color: '#2563eb', label: 'Virtual' },
  in_person: { bg: '#dcfce7', color: '#166534', label: 'In Person' },
  hybrid:    { bg: '#fef9c3', color: '#854d0e', label: 'Hybrid' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function dateBadge(iso) {
  if (!iso) return { month: '—', day: '—' }
  const d = new Date(iso)
  return {
    month: d.toLocaleDateString([], { month: 'short' }).toUpperCase(),
    day: String(d.getDate()),
  }
}

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function fromLocalInput(val) {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function blankForm() {
  const start = new Date(Date.now() + 3600000)
  const end   = new Date(start.getTime() + 3600000)
  return {
    title: '', description: '', organizer_name: '',
    mode: 'virtual', location: '', meeting_url: '',
    start_at: toLocalInput(start.toISOString()),
    end_at:   toLocalInput(end.toISOString()),
    tags: '', is_active: true,
  }
}

function validateForm(f) {
  if (!f.title.trim())          return 'Title is required.'
  if (!f.description.trim())    return 'Description is required.'
  if (!f.organizer_name.trim()) return 'Organizer name is required.'
  const s = fromLocalInput(f.start_at)
  const e = fromLocalInput(f.end_at)
  if (!s || !e) return 'Start and end date/time are required.'
  if (new Date(s) >= new Date(e)) return 'End must be after start.'
  if ((f.mode === 'in_person' || f.mode === 'hybrid') && !f.location.trim())
    return 'Location is required for in-person/hybrid events.'
  if ((f.mode === 'virtual' || f.mode === 'hybrid') && !f.meeting_url.trim())
    return 'Meeting URL is required for virtual/hybrid events.'
  return ''
}

function buildPayload(f) {
  return {
    title:          f.title.trim(),
    description:    f.description.trim(),
    organizer_name: f.organizer_name.trim(),
    mode:           f.mode,
    location:       f.mode === 'virtual'   ? null : f.location.trim() || null,
    meeting_url:    f.mode === 'in_person' ? null : f.meeting_url.trim() || null,
    start_at:       fromLocalInput(f.start_at),
    end_at:         fromLocalInput(f.end_at),
    tags:           f.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    is_active:      true,
  }
}

// ─── main component ───────────────────────────────────────────────────────────

export default function EventsTab() {
  const { user } = useUser()

  const roles      = (user?.roles ?? (user?.role ? [user.role] : [])).map(r => String(r).toLowerCase())
  const canHost    = roles.includes('admin') || roles.includes('university')
  const isAdmin    = roles.includes('admin')

  const [events,      setEvents]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const [search, setSearch] = useState('')

  const [showForm,    setShowForm]    = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)  // null = create, event = edit

  // modal
  const [modalEvent, setModalEvent] = useState(null)

  // RSVP success calendar url
  const [calendarUrl, setCalendarUrl] = useState(null)

  function loadEvents() {
    setLoading(true)
    setError(null)
    getEvents({ upcomingOnly: true, limit: 50 })
      .then(data => setEvents(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEvents() }, []) // eslint-disable-line

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events
    return events.filter(e =>
      [e.title, e.description, e.organizer_name, e.location, ...(e.tags ?? [])]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [events, search])

  // ── RSVP toggle ────────────────────────────────────────────────────────────
  async function handleRsvp(event) {
    const attending = !!event.my_rsvp_status
    try {
      if (attending) {
        await cancelRsvp(event.id)
        setCalendarUrl(null)
      } else {
        const res = await rsvpEvent(event.id)
        setCalendarUrl(res?.google_calendar_url ?? null)
      }
      const updated = { ...event, my_rsvp_status: attending ? null : 'confirmed', rsvp_count: (event.rsvp_count ?? 0) + (attending ? -1 : 1) }
      setEvents(prev => prev.map(e => e.id === event.id ? updated : e))
      // keep modal in sync
      if (modalEvent?.id === event.id) setModalEvent(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  // ── form submit ────────────────────────────────────────────────────────────
  async function handleFormSave(form) {
    const payload = buildPayload(form)
    if (editingEvent) {
      const updated = await updateEvent(editingEvent.id, payload)
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    } else {
      const created = await createEvent(payload)
      setEvents(prev => [created, ...prev])
    }
    setShowForm(false)
    setEditingEvent(null)
  }

  function openCreate() { setEditingEvent(null); setShowForm(true) }
  function openEdit(ev) { setEditingEvent(ev);   setShowForm(true) }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* event detail modal — rendered via portal so it escapes any parent stacking context */}
      {modalEvent && createPortal(
        <EventModal
          event={modalEvent}
          canEdit={isAdmin || String(modalEvent.hosted_by) === String(user?.id)}
          onClose={() => setModalEvent(null)}
          onRsvp={() => handleRsvp(modalEvent)}
          onEdit={() => { setModalEvent(null); openEdit(modalEvent); setShowForm(true) }}
          onUpdated={updated => {
            setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
            setModalEvent(updated)
          }}
        />,
        document.body
      )}

      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          Upcoming Events
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {canHost && (
            <button
              onClick={() => showForm ? setShowForm(false) : openCreate()}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#4a7c59', color: '#fff', border: 'none',
                borderRadius: '999px', padding: '5px 12px', fontSize: '12px',
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 600,
              }}
            >
              {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Create Event</>}
            </button>
          )}
        </div>
      </div>

      {/* create / edit form */}
      {showForm && (
        <EventForm
          initial={editingEvent}
          onSave={handleFormSave}
          onCancel={() => { setShowForm(false); setEditingEvent(null) }}
        />
      )}

      {/* search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.6)', borderRadius: '12px',
        padding: '8px 12px', border: '1px solid rgba(0,0,0,0.07)',
      }}>
        <Calendar size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search events…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#1f2937' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        )}
      </div>

      {/* calendar url banner */}
      {calendarUrl && (
        <a href={calendarUrl} target="_blank" rel="noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px',
          background: '#dcfce7', color: '#166534', borderRadius: '10px', padding: '8px 12px',
          textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        }}>
          <Calendar size={13} /> Add to Google Calendar <ExternalLink size={11} />
        </a>
      )}

      {error && <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}

      {/* content */}
      {loading ? (
        <LoadingList />
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '48px 16px' }}>
          <LayoutList size={28} style={{ color: '#c0d8c0' }} />
          <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
            {search ? `No events matching "${search}".` : 'No events yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              canEdit={isAdmin || String(event.hosted_by) === String(user?.id)}
              onOpenModal={() => setModalEvent(event)}
              onRsvp={() => handleRsvp(event)}
              onEdit={() => { openEdit(event); setShowForm(true) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({ event, canEdit, onOpenModal, onRsvp, onEdit }) {
  const badge     = dateBadge(event.start_at)
  const attending = !!event.my_rsvp_status
  const ms        = MODE_STYLE[event.mode] ?? MODE_STYLE.virtual
  const isVirtual = event.mode === 'virtual'

  return (
    <div
      onClick={onOpenModal}
      style={{
        background: 'rgba(255,255,255,0.65)', borderRadius: '16px',
        border: '1px solid rgba(10,42,15,0.07)', backdropFilter: 'blur(4px)',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'box-shadow 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(10,42,15,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* banner thumbnail if exists */}
      {event.banner_url && (
        <img src={event.banner_url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
      )}

      <div style={{ display: 'flex', gap: '12px', padding: '14px' }}>
        {/* date block */}
        <div style={{
          flexShrink: 0, width: '52px', borderRadius: '12px',
          background: 'linear-gradient(160deg,#113018,#265d34)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '8px 4px',
        }}>
          <span style={{ fontSize: '9px', color: '#b9e4b7', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{badge.month}</span>
          <span style={{ fontSize: '22px', color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 800, lineHeight: 1 }}>{badge.day}</span>
        </div>

        {/* info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
              {event.title}
            </p>
            <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: ms.bg, color: ms.color, fontFamily: "'DM Sans', sans-serif" }}>
              {ms.label}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>{event.organizer_name}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
              <Clock size={11} /> {fmtTime(event.start_at)}, {fmtDate(event.start_at)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
              {isVirtual ? <Video size={11} /> : <MapPin size={11} />}
              {isVirtual ? 'Online' : (event.location || 'Location TBA')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
              <Users size={11} /> {event.rsvp_count ?? 0}
            </span>
          </div>

          {(event.tags ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {event.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(10,42,15,0.06)', color: '#3a6040', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Tag size={8} />{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(10,42,15,0.04)', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                  +{event.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={e => { e.stopPropagation(); onRsvp() }}
              style={{
                fontSize: '11px', fontWeight: 700, padding: '5px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: attending ? '#0a2a0f' : 'transparent',
                color: attending ? '#dff89a' : '#3a6040',
                outline: attending ? 'none' : '1px solid #3a6040',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {attending ? 'Going ✓' : 'RSVP'}
            </button>
            {canEdit && (
              <button onClick={e => { e.stopPropagation(); onEdit() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                <Edit3 size={12} /> Edit
              </button>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
              View details →
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EventModal ───────────────────────────────────────────────────────────────

function EventModal({ event, canEdit, onClose, onRsvp, onEdit }) {
  const attending = !!event.my_rsvp_status
  const ms        = MODE_STYLE[event.mode] ?? MODE_STYLE.virtual
  const isVirtual = event.mode === 'virtual'
  const badge     = dateBadge(event.start_at)

  // close on Escape + lock body scroll
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#f0f9f0',
          borderRadius: '20px',
          width: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header band */}
        <div style={{
          background: event.banner_url
            ? `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.65)), url(${event.banner_url}) center/cover no-repeat`
            : 'linear-gradient(135deg,#0a2a0f,#1a5c28)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 20px',
          position: 'relative',
        }}>
          {/* close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: '28px', height: '28px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <X size={14} />
          </button>

          {/* date + mode badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px',
            }}>
              <span style={{ fontSize: '9px', color: '#b9e4b7', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{badge.month}</span>
              <span style={{ fontSize: '20px', color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 800, lineHeight: 1 }}>{badge.day}</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: ms.bg, color: ms.color, fontFamily: "'DM Sans', sans-serif" }}>
              {ms.label}
            </span>
          </div>

          {/* title */}
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#fff', fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>
            {event.title}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Sans', sans-serif" }}>
            by {event.organizer_name}
          </p>
        </div>

        {/* body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* key info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px' }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Date & Time</p>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                {fmtDate(event.start_at)}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
                {fmtTime(event.start_at)} – {fmtTime(event.end_at)}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px' }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Location</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isVirtual ? <Video size={12} style={{ color: '#5a8060', flexShrink: 0 }} /> : <MapPin size={12} style={{ color: '#5a8060', flexShrink: 0 }} />}
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                  {isVirtual ? 'Online' : (event.location || 'TBA')}
                </p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px' }}>
              <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Attendees</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} style={{ color: '#5a8060' }} />
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif" }}>
                  {event.rsvp_count ?? 0} going
                </p>
              </div>
            </div>
            {event.meeting_url && (
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px' }}>
                <p style={{ margin: '0 0 3px', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Meeting Link</p>
                <a href={event.meeting_url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#2563eb', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
                  Join <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>

          {/* description */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>About</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
              {event.description}
            </p>
          </div>

          {/* tags */}
          {(event.tags ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {event.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', padding: '3px 9px', borderRadius: '999px',
                  background: 'rgba(10,42,15,0.07)', color: '#3a6040',
                  fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={onRsvp}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: attending ? '#0a2a0f' : '#4a7c59',
                color: attending ? '#dff89a' : '#fff',
                fontSize: '13px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {attending ? '✓ Going — Cancel RSVP' : 'RSVP to this event'}
            </button>
            {canEdit && (
              <button
                onClick={onEdit}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '12px 16px', borderRadius: '12px',
                  border: '1px solid rgba(10,42,15,0.15)', background: 'rgba(255,255,255,0.6)',
                  color: '#3a6040', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Edit3 size={13} /> Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EventForm ────────────────────────────────────────────────────────────────

function EventForm({ initial, onSave, onCancel }) {
  const [form,       setForm]       = useState(() => initial
    ? {
        title:          initial.title ?? '',
        description:    initial.description ?? '',
        organizer_name: initial.organizer_name ?? '',
        mode:           initial.mode ?? 'virtual',
        location:       initial.location ?? '',
        meeting_url:    initial.meeting_url ?? '',
        start_at:       toLocalInput(initial.start_at),
        end_at:         toLocalInput(initial.end_at),
        tags:           (initial.tags ?? []).join(', '),
        is_active:      true,
      }
    : blankForm()
  )
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit() {
    const validErr = validateForm(form)
    if (validErr) { setErr(validErr); return }
    setSaving(true)
    setErr('')
    try {
      await onSave(form)
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  const needsLocation = form.mode === 'in_person' || form.mode === 'hybrid'
  const needsUrl      = form.mode === 'virtual'   || form.mode === 'hybrid'

  const inputStyle = {
    width: '100%', borderRadius: '10px', border: '1px solid #d1d5db',
    padding: '8px 10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '16px', border: '1px solid #d1fae5' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>
        {initial ? 'Edit Event' : 'New Event'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Event title *" style={inputStyle} />
        <input value={form.organizer_name} onChange={e => set('organizer_name', e.target.value)} placeholder="Organizer name *" style={inputStyle} />
        <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description *" rows={3}
          style={{ ...inputStyle, resize: 'vertical' }} />

        {/* mode selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {MODES.map(m => {
            const s = MODE_STYLE[m]
            const active = form.mode === m
            return (
              <button key={m} onClick={() => set('mode', m)}
                style={{
                  flex: 1, padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: active ? 700 : 400,
                  border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  background: active ? s.color : s.bg, color: active ? '#fff' : s.color,
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {needsLocation && (
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Location *" style={inputStyle} />
        )}
        {needsUrl && (
          <input value={form.meeting_url} onChange={e => set('meeting_url', e.target.value)} placeholder="Meeting URL (https://…) *" style={inputStyle} />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Start *</label>
            <input type="datetime-local" value={form.start_at} onChange={e => set('start_at', e.target.value)} style={{ ...inputStyle, marginTop: '3px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>End *</label>
            <input type="datetime-local" value={form.end_at} onChange={e => set('end_at', e.target.value)} style={{ ...inputStyle, marginTop: '3px' }} />
          </div>
        </div>

        <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Tags (comma separated, e.g. career, networking)" style={inputStyle} />
      </div>

      {err && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '8px', fontFamily: "'DM Sans', sans-serif" }}>{err}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#6b7280' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: '#4a7c59', color: '#fff', border: 'none', borderRadius: '999px',
            padding: '5px 16px', fontSize: '12px', fontWeight: 600,
            cursor: saving ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
          {initial ? 'Save Changes' : 'Create Event'}
        </button>
      </div>
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function LoadingList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse" style={{ borderRadius: '16px', height: '110px', background: 'rgba(255,255,255,0.4)' }} />
      ))}
    </div>
  )
}
