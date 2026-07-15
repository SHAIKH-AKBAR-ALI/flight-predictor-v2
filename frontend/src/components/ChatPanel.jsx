import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/client'

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai']

const AIRLINE_ICONS = {
  AirAsia: '🔴', Air_India: '🇮🇳', GO_FIRST: '🔵', Indigo: '🟣', SpiceJet: '🌶️', Vistara: '🟡',
}

const IATA = { Delhi: 'DEL', Mumbai: 'BOM', Bangalore: 'BLR', Kolkata: 'CCU', Hyderabad: 'HYD', Chennai: 'MAA' }

function Barcode({ seed }) {
  const bars = []
  let x = 0
  for (let i = 0; i < 48; i++) {
    const w = 1 + ((seed.charCodeAt(i % seed.length) * (i + 7)) % 3)
    bars.push({ x, w })
    x += w + 1.5
  }
  return (
    <svg width={x} height="40" style={{ display: 'block' }} aria-hidden="true">
      {bars.map((b, i) => <rect key={i} x={b.x} width={b.w} height="40" fill="#1a1a2e" />)}
    </svg>
  )
}

function Ticket({ booking }) {
  const { offer, passenger, confirmation_id } = booking
  const n = parseInt(confirmation_id.slice(2), 16)
  const seat = `${(n % 30) + 1}${'ABCDEF'[n % 6]}`
  const gate = `${(n % 22) + 1}`
  const label = { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#8a8aa3', fontWeight: 600 }
  const value = { fontSize: 14, fontWeight: 700, color: '#1a1a2e' }

  return (
    <motion.div
      data-testid="booking-confirmed"
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      style={{
        // flexShrink 0: overflow:hidden zeroes the flex min-height floor,
        // letting the scroll pane squash the ticket to 0px tall
        maxWidth: 480, borderRadius: 14, overflow: 'hidden', position: 'relative', flexShrink: 0,
        background: '#f7f7fb', color: '#1a1a2e', fontFamily: 'Inter, sans-serif',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <span style={{
          transform: 'rotate(-18deg)', fontSize: 26, fontWeight: 800, letterSpacing: 4,
          color: 'rgba(124,58,237,0.13)', border: '3px solid rgba(124,58,237,0.13)',
          padding: '4px 18px', borderRadius: 8, whiteSpace: 'nowrap',
        }}>
          MOCK TICKET · DEMO
        </span>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff',
      }}>
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>
          {AIRLINE_ICONS[offer.airline] || '✈️'} {offer.airline.replace('_', ' ').toUpperCase()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>BOARDING PASS · {offer.flight_id}</span>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{IATA[offer.origin] || '???'}</div>
            <div style={{ fontSize: 11, color: '#8a8aa3' }}>{offer.origin}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', color: '#7c3aed', fontSize: 18 }}>✈ ─────</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{IATA[offer.destination] || '???'}</div>
            <div style={{ fontSize: 11, color: '#8a8aa3' }}>{offer.destination}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <div><div style={label}>Passenger</div><div style={{ ...value, fontSize: 12 }}>{passenger.name}</div></div>
          <div><div style={label}>Date</div><div style={value}>{offer.date}</div></div>
          <div><div style={label}>Seat</div><div style={value}>{seat}</div></div>
          <div><div style={label}>Gate</div><div style={value}>{gate}</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <div><div style={label}>Class</div><div style={{ ...value, fontSize: 12 }}>{offer.flight_class}</div></div>
          <div><div style={label}>Departure</div><div style={{ ...value, fontSize: 12 }}>{offer.departure_time.replace('_', ' ')}</div></div>
          <div><div style={label}>Fare</div><div style={{ ...value, fontSize: 12 }}>₹{offer.price_inr.toLocaleString('en-IN')}</div></div>
          <div><div style={label}>Status</div><div style={{ ...value, fontSize: 12, color: '#16a34a' }}>CONFIRMED</div></div>
        </div>
      </div>

      <div style={{
        borderTop: '2px dashed #c9c9dd', padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={label}>Confirmation ID</div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 2 }}>ID {confirmation_id}</div>
        </div>
        <Barcode seed={confirmation_id} />
      </div>
    </motion.div>
  )
}

function TripPicker({ onSearch, disabled }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  const selectStyle = {
    padding: '10px 12px', borderRadius: 10, outline: 'none',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif',
  }

  return (
    <form
      data-testid="trip-picker"
      onSubmit={e => { e.preventDefault(); onSearch(`Find flights from ${from} to ${to} on ${date}`) }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, maxWidth: '95%' }}
    >
      <select value={from} onChange={e => setFrom(e.target.value)} required aria-label="From city" style={selectStyle}>
        <option value="" disabled>From</option>
        {CITIES.map(c => <option key={c} value={c} disabled={c === to} style={{ color: '#000' }}>{c}</option>)}
      </select>
      <select value={to} onChange={e => setTo(e.target.value)} required aria-label="To city" style={selectStyle}>
        <option value="" disabled>To</option>
        {CITIES.map(c => <option key={c} value={c} disabled={c === from} style={{ color: '#000' }}>{c}</option>)}
      </select>
      <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required
        aria-label="Travel date" style={{ ...selectStyle, colorScheme: 'dark' }} />
      <button
        type="submit"
        disabled={disabled || !from || !to || !date}
        style={{
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff',
          fontSize: 13, fontWeight: 600,
          cursor: disabled || !from || !to || !date ? 'default' : 'pointer',
          opacity: disabled || !from || !to || !date ? 0.5 : 1,
        }}
      >
        Search
      </button>
    </form>
  )
}

function PassengerForm({ onSubmit, disabled }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const fieldStyle = {
    padding: '10px 12px', borderRadius: 10, outline: 'none',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif',
  }

  return (
    <form
      data-testid="passenger-form"
      onSubmit={e => { e.preventDefault(); onSubmit(`Passenger is ${name.trim()}, email ${email.trim()}`) }}
      className="glass"
      style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 12, maxWidth: '95%' }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Passenger details</div>
      <input value={name} onChange={e => setName(e.target.value)} required minLength={2}
        placeholder="Full name" aria-label="Passenger full name" style={fieldStyle} />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
        placeholder="Email" aria-label="Passenger email" style={fieldStyle} />
      <button
        type="submit"
        disabled={disabled || !name.trim() || !email.trim()}
        style={{
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff',
          fontSize: 13, fontWeight: 600,
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled || !name.trim() || !email.trim() ? 0.5 : 1,
        }}
      >
        Continue
      </button>
    </form>
  )
}

function OfferCard({ offer, onSelect, disabled }) {
  return (
    <div className="glass" data-testid="offer-card" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px', borderRadius: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
          {AIRLINE_ICONS[offer.airline] || '✈️'} {offer.airline.replace('_', ' ')}{' '}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{offer.flight_id}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          {offer.departure_time.replace('_', ' ')} · {offer.stops === 'zero' ? 'non-stop' : offer.stops === 'one' ? '1 stop' : '2+ stops'} · {offer.duration_hours}h · {offer.seats_left} seats left
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>₹{offer.price_inr.toLocaleString('en-IN')}</span>
        <button
          onClick={() => onSelect(offer)}
          disabled={disabled}
          style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: disabled ? 'default' : 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff',
            fontSize: 13, fontWeight: 600, opacity: disabled ? 0.5 : 1,
          }}
        >
          Select
        </button>
      </div>
    </div>
  )
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: "Hi! I can find and book Indian domestic flights. Where are you flying from and to, and on what date?",
  }])
  const [input, setInput] = useState('')
  const [offers, setOffers] = useState([])
  const [booking, setBooking] = useState(null)
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)
  const sessionRef = useRef(null)

  // fresh session per page load — the UI resets on reload, so resuming the old
  // server-side session only leaks ghost context into a visually new chat
  if (!sessionRef.current) sessionRef.current = crypto.randomUUID()

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, offers, busy, booking])

  const send = async (text) => {
    if (!text.trim() || busy) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setBusy(true)
    try {
      const { data } = await api.post('/chat', { session_id: sessionRef.current, message: text }, { timeout: 120000 })
      setMessages(m => [...m, { role: 'assistant', text: data.reply, offers: data.offers }])
      setOffers(data.offers || [])
      setBooking(data.booking)
    } catch (err) {
      setMessages(m => [...m, {
        role: 'assistant',
        text: typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : 'The assistant is unreachable right now. Check that the backend is running, then try again.',
      }])
    } finally {
      setBusy(false)
    }
  }

  const confirmed = booking?.stage === 'confirmed'

  return (
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: 'min(72vh, 720px)' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.55,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(m.role === 'user'
                ? { marginLeft: 'auto', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', borderBottomRightRadius: 4 }
                : { marginRight: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: 4 }),
            }}>
              {m.text}
            </div>
            {i === 0 && messages.length === 1 && (
              <TripPicker onSearch={send} disabled={busy} />
            )}
            {m.role === 'assistant' && m.offers?.length > 0 && i === messages.length - 1 && !confirmed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, maxWidth: '95%' }}>
                {m.offers.map(o => (
                  <OfferCard key={o.flight_id} offer={o} disabled={busy}
                    onSelect={offer => send(`I'd like to book flight ${offer.flight_id} (${offer.airline}, ₹${offer.price_inr})`)} />
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {booking?.stage === 'selected' && !busy && (
          <PassengerForm onSubmit={send} disabled={busy} />
        )}

        {booking?.stage === 'ready' && !busy && (
          <button
            data-testid="confirm-booking"
            onClick={() => send('Yes, I confirm the booking')}
            style={{
              alignSelf: 'flex-start', padding: '11px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ✓ Confirm booking
          </button>
        )}

        {confirmed && (booking.offer ? (
          <Ticket booking={booking} />
        ) : (
          <div data-testid="booking-confirmed" style={{
            padding: '14px 18px', borderRadius: 12,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#86efac', fontSize: 14, fontWeight: 600,
          }}>
            ✅ Booking confirmed — ID {booking.confirmation_id}
            <div style={{ fontWeight: 400, fontSize: 12, color: 'rgba(134,239,172,0.7)', marginTop: 4 }}>
              Mock booking for demo purposes. No real ticket or payment.
            </div>
          </div>
        ))}

        {busy && (
          <div style={{ display: 'flex', gap: 5, padding: '6px 2px' }} aria-label="Assistant is typing">
            {[0, 1, 2].map(i => (
              <motion.span key={i}
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25 }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={e => { e.preventDefault(); send(input) }}
        style={{ display: 'flex', gap: 10, padding: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Try "find flights Delhi to Mumbai next Friday"'
          aria-label="Message the flight assistant"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, outline: 'none',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif',
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          style={{
            padding: '12px 22px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: busy ? 'default' : 'pointer',
            opacity: busy || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
