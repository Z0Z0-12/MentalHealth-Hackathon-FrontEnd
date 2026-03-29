import { useState, useEffect, useMemo } from 'react'
import {
  MapPin, Home, DollarSign, BedDouble, Bath,
  Plus, X, Search, ChevronDown, ChevronUp,
  Loader2, Phone, Mail, Tag, CheckCircle2,
} from 'lucide-react'
import { getApartments, createApartment } from '../api/housing'

// ─── static housing photos (cycled across listings) ──────────────────────────

const HOUSING_PHOTOS = [
  '/Photo1.jpg', '/Photo2.jpeg', '/Photo3.avif', '/Photo4.jpg',
  '/Photo5.jpg', '/Photo6.jpg',  '/Photo7.webp', '/Photo8.jpg',
  '/Photo9.webp', '/Photo10.webp', '/Photo11.jpg', '/Photo12.jpg',
]

// ─── helpers ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

function fmtRent(n) {
  return n != null ? `$${Number(n).toLocaleString()}/mo` : '—'
}

function fmtDate(str) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? str : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function blankForm() {
  return {
    title: '', description: '', address: '', city: '', state: '', zip_code: '',
    monthly_rent: '', bedrooms: '1', bathrooms: '1',
    is_furnished: false, available_from: '',
    amenities: '', contact_email: '', contact_phone: '',
  }
}

function validateForm(f) {
  if (!f.title.trim())         return 'Title is required.'
  if (!f.description.trim())   return 'Description is required.'
  if (!f.address.trim())       return 'Address is required.'
  if (!f.city.trim())          return 'City is required.'
  if (!f.state.trim())         return 'State is required.'
  if (!f.zip_code.trim())      return 'Zip code is required.'
  if (!f.contact_email.trim()) return 'Contact email is required.'
  const rent = parseFloat(f.monthly_rent)
  if (!f.monthly_rent || isNaN(rent) || rent <= 0) return 'Monthly rent must be a positive number.'
  return ''
}

function buildPayload(f) {
  return {
    title:          f.title.trim(),
    description:    f.description.trim(),
    address:        f.address.trim(),
    city:           f.city.trim(),
    state:          f.state.trim(),
    zip_code:       f.zip_code.trim(),
    monthly_rent:   parseFloat(f.monthly_rent),
    bedrooms:       parseInt(f.bedrooms) || 1,
    bathrooms:      parseFloat(f.bathrooms) || 1,
    is_furnished:   f.is_furnished,
    available_from: f.available_from || null,
    amenities:      f.amenities.split(',').map(a => a.trim()).filter(Boolean),
    contact_email:  f.contact_email.trim(),
    contact_phone:  f.contact_phone.trim() || null,
    images_urls:    [],
  }
}

// ─── main component ───────────────────────────────────────────────────────────

export default function HousingTab() {
  const [apartments,   setApartments]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [total,        setTotal]        = useState(0)
  const [loadingMore,  setLoadingMore]  = useState(false)

  // filters
  const [search,       setSearch]       = useState('')
  const [maxRent,      setMaxRent]      = useState('')

  // post form
  const [showForm,     setShowForm]     = useState(false)
  const [posted,       setPosted]       = useState(false)

  function loadAll(reset = false) {
    const skip = reset ? 0 : apartments.length
    if (reset) setLoading(true)
    else setLoadingMore(true)

    const filters = {
      skip,
      limit: PAGE_SIZE,
      maxRent: maxRent ? parseFloat(maxRent) : undefined,
    }

    getApartments(filters)
      .then(data => {
        const items = data?.items ?? []
        setApartments(prev => reset ? items : [...prev, ...items])
        setTotal(data?.total ?? 0)
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }

  useEffect(() => { loadAll(true) }, [maxRent]) // eslint-disable-line

  // client-side search within loaded results
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return apartments
    return apartments.filter(a =>
      [a.title, a.city, a.state, a.address, ...(a.amenities ?? [])]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [apartments, search])

  const hasMore = apartments.length < total

  function onPostCreated(newApt) {
    setApartments(prev => [newApt, ...prev])
    setShowForm(false)
    setPosted(true)
    setTimeout(() => setPosted(false), 4000)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          Apartment Listings
        </span>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: '#4a7c59', color: '#fff', border: 'none',
            borderRadius: '999px', padding: '5px 12px', fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 600,
          }}
        >
          {showForm ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Post Apartment</>}
        </button>
      </div>

      {/* success banner */}
      {posted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dcfce7', borderRadius: '10px', padding: '10px 12px' }}>
          <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: '#166534', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            Apartment posted successfully!
          </p>
        </div>
      )}

      {/* post form */}
      {showForm && <PostForm onCreated={onPostCreated} onCancel={() => setShowForm(false)} />}

      {/* filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* search */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.6)', borderRadius: '12px',
          padding: '8px 12px', border: '1px solid rgba(0,0,0,0.07)', minWidth: '160px',
        }}>
          <Search size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search city, title, amenity…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#1f2937' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>}
        </div>
        {/* max rent */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.6)', borderRadius: '12px',
          padding: '8px 12px', border: '1px solid rgba(0,0,0,0.07)',
        }}>
          <DollarSign size={13} style={{ color: '#9ca3af' }} />
          <input
            type="number" value={maxRent} onChange={e => setMaxRent(e.target.value)}
            placeholder="Max rent"
            style={{ width: '80px', border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#1f2937' }}
          />
          {maxRent && <button onClick={() => setMaxRent('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>}
        </div>
      </div>

      {error && <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}

      {/* content */}
      {loading ? (
        <LoadingList />
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '48px 16px' }}>
          <Home size={28} style={{ color: '#c0d8c0' }} />
          <p style={{ fontSize: '13px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
            {search ? `No results for "${search}".` : 'No apartments listed yet.'}
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
            {search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : `${total} listing${total !== 1 ? 's' : ''}`}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((apt, i) => <ApartmentCard key={apt.id} apt={apt} photoIndex={i} />)}
          </div>

          {hasMore && !search && (
            <button
              onClick={() => loadAll(false)}
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

// ─── ApartmentCard ────────────────────────────────────────────────────────────

function ApartmentCard({ apt, photoIndex }) {
  const [expanded, setExpanded] = useState(false)
  const photo = HOUSING_PHOTOS[photoIndex % HOUSING_PHOTOS.length]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)', borderRadius: '16px',
      border: '1px solid rgba(10,42,15,0.07)', backdropFilter: 'blur(4px)',
      overflow: 'hidden',
    }}>
      {/* card body: image left, content right */}
      <div style={{ display: 'flex', flexDirection: 'row' }}>

        {/* image column */}
        <div style={{ position: 'relative', width: '170px', flexShrink: 0, overflow: 'hidden', borderRadius: '16px 0 0 16px' }}>
          <img
            src={photo} alt={apt.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* rent badge */}
          <div style={{
            position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(10,42,15,0.82)', backdropFilter: 'blur(6px)',
            borderRadius: '999px', padding: '3px 9px', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <DollarSign size={10} style={{ color: '#dff89a' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#dff89a', fontFamily: "'DM Sans', sans-serif" }}>
              {fmtRent(apt.monthly_rent)}
            </span>
          </div>
          {/* furnished badge */}
          {apt.is_furnished && (
            <span style={{
              position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '9px', fontWeight: 600, background: 'rgba(22,163,74,0.85)',
              color: '#fff', borderRadius: '999px', padding: '2px 7px', whiteSpace: 'nowrap',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Furnished
            </span>
          )}
        </div>

        {/* main content */}
        <div style={{ flex: 1, minWidth: 0, padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* title + badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0a2a0f', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
            {apt.title}
          </p>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {apt.is_available === false && (
              <span style={{ fontSize: '10px', fontWeight: 600, background: '#fee2e2', color: '#dc2626', borderRadius: '999px', padding: '2px 8px', fontFamily: "'DM Sans', sans-serif" }}>
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} style={{ color: '#5a8060', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
            {[apt.city, apt.state].filter(Boolean).join(', ')}
          </span>
        </div>

        {/* beds + baths */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BedDouble size={11} style={{ color: '#5a8060' }} />
            <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
              {apt.bedrooms ?? 0} bed{apt.bedrooms !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bath size={11} style={{ color: '#5a8060' }} />
            <span style={{ fontSize: '11px', color: '#5a8060', fontFamily: "'DM Sans', sans-serif" }}>
              {apt.bathrooms ?? 1} bath{apt.bathrooms !== 1 ? 's' : ''}
            </span>
          </div>
          {apt.available_from && (
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
              Available {fmtDate(apt.available_from)}
            </span>
          )}
        </div>

        {/* description preview */}
        {apt.description && !expanded && (
          <p style={{ margin: 0, fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {apt.description}
          </p>
        )}

        {/* footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <a href={`mailto:${apt.contact_email}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700,
            color: '#fff', background: '#0a2a0f', borderRadius: '999px', padding: '6px 14px',
            textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
          }}>
            <Mail size={11} /> Contact
          </a>
          <button onClick={() => setExpanded(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none',
            cursor: 'pointer', color: expanded ? '#4a7c59' : '#9ca3af', fontSize: '11px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {expanded ? <><ChevronUp size={13} /> Less</> : <><ChevronDown size={13} /> More details</>}
          </button>
        </div>{/* footer row */}
        </div>{/* end content */}
      </div>{/* end row */}

      {/* expanded details — full width below */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* full description */}
          {apt.description && (
            <p style={{ margin: 0, fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              {apt.description}
            </p>
          )}

          {/* address */}
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Full Address</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#1f2937', fontFamily: "'DM Sans', sans-serif" }}>
              {[apt.address, apt.city, apt.state, apt.zip_code].filter(Boolean).join(', ')}
            </p>
          </div>

          {/* amenities */}
          {(apt.amenities ?? []).length > 0 && (
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '10px', color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>Amenities</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {apt.amenities.map(a => (
                  <span key={a} style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                    background: 'rgba(10,42,15,0.06)', color: '#3a6040',
                    fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '3px',
                  }}>
                    <Tag size={8} />{a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* contact */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={`mailto:${apt.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
              <Mail size={12} /> {apt.contact_email}
            </a>
            {apt.contact_phone && (
              <a href={`tel:${apt.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
                <Phone size={12} /> {apt.contact_phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PostForm ─────────────────────────────────────────────────────────────────

function PostForm({ onCreated, onCancel }) {
  const [form,     setForm]     = useState(blankForm())
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const inputStyle = {
    width: '100%', borderRadius: '10px', border: '1px solid #d1d5db',
    padding: '8px 10px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  }

  async function handleSubmit() {
    const validErr = validateForm(form)
    if (validErr) { setErr(validErr); return }
    setSaving(true)
    setErr('')
    try {
      const created = await createApartment(buildPayload(form))
      onCreated(created)
    } catch (e) {
      setErr(e.message)
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '16px', border: '1px solid #d1fae5' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>
        Post an Apartment
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Listing title *" style={inputStyle} />
        <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description *" rows={3}
          style={{ ...inputStyle, resize: 'vertical' }} />
        <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address *" style={inputStyle} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '8px' }}>
          <input value={form.city}     onChange={e => set('city', e.target.value)}     placeholder="City *"     style={inputStyle} />
          <input value={form.state}    onChange={e => set('state', e.target.value)}    placeholder="State *"    style={inputStyle} />
          <input value={form.zip_code} onChange={e => set('zip_code', e.target.value)} placeholder="Zip *"      style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Monthly Rent ($) *</label>
            <input type="number" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)}
              placeholder="e.g. 1200" style={{ ...inputStyle, marginTop: '3px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Bedrooms</label>
            <input type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
              style={{ ...inputStyle, marginTop: '3px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Bathrooms</label>
            <input type="number" min="0" step="0.5" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
              style={{ ...inputStyle, marginTop: '3px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>Available From</label>
            <input type="date" value={form.available_from} onChange={e => set('available_from', e.target.value)}
              style={{ ...inputStyle, marginTop: '3px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={form.is_furnished} onChange={e => set('is_furnished', e.target.checked)}
                style={{ accentColor: '#4a7c59', width: '14px', height: '14px' }} />
              <span style={{ fontSize: '12px', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>Furnished</span>
            </label>
          </div>
        </div>

        <input value={form.amenities} onChange={e => set('amenities', e.target.value)}
          placeholder="Amenities (comma separated, e.g. WiFi, Parking, Gym)" style={inputStyle} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
            placeholder="Contact email *" type="email" style={inputStyle} />
          <input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
            placeholder="Contact phone (optional)" style={inputStyle} />
        </div>
      </div>

      {err && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '8px', fontFamily: "'DM Sans', sans-serif" }}>{err}</p>}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
        <button onClick={onCancel} style={{
          background: 'none', border: '1px solid #d1d5db', borderRadius: '999px',
          padding: '5px 14px', fontSize: '12px', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", color: '#6b7280',
        }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: '#4a7c59', color: '#fff', border: 'none',
          borderRadius: '999px', padding: '5px 16px', fontSize: '12px', fontWeight: 600,
          cursor: saving ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
          Post Listing
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
