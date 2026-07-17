import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/client'

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai']

const IATA = { Delhi: 'DEL', Mumbai: 'BOM', Bangalore: 'BLR', Kolkata: 'CCU', Hyderabad: 'HYD', Chennai: 'MAA' }

const mono = { fontFamily: 'var(--mono)' }

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
      {bars.map((b, i) => <rect key={i} x={b.x} width={b.w} height="40" fill="#101a30" />)}
    </svg>
  )
}

function Ticket({ booking }) {
  const { offer, passenger, confirmation_id } = booking
  const n = parseInt(confirmation_id.slice(2), 16)
  const seat = `${(n % 30) + 1}${'ABCDEF'[n % 6]}`
  const gate = `${(n % 22) + 1}`
  const label = { ...mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7c86a0' }
  const value = { fontSize: 14, fontWeight: 700, color: '#101a30' }

  return (
    <motion.div
      data-testid="booking-confirmed"
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      style={{
        // flexShrink 0: overflow:hidden zeroes the flex min-height floor,
        // letting the scroll pane squash the ticket to 0px tall
        maxWidth: 480, borderRadius: 14, overflow: 'hidden', position: 'relative', flexShrink: 0,
        background: '#f4f6fb', color: '#101a30', fontFamily: 'var(--body)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 1,
      }}>
        <span style={{
          ...mono, transform: 'rotate(-18deg)', fontSize: 24, fontWeight: 700, letterSpacing: 4,
          color: 'rgba(16,26,48,0.10)', border: '3px solid rgba(16,26,48,0.10)',
          padding: '4px 18px', borderRadius: 8, whiteSpace: 'nowrap',
        }}>
          MOCK TICKET · DEMO
        </span>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', background: 'var(--amber)', color: 'var(--amber-ink)',
      }}>
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>
          ✈ {offer.airline.replace('_', ' ').toUpperCase()}
        </span>
        <span style={{ ...mono, fontSize: 11, fontWeight: 700 }}>BOARDING PASS · {offer.flight_id}</span>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ ...mono, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{IATA[offer.origin] || '???'}</div>
            <div style={{ fontSize: 11, color: '#7c86a0' }}>{offer.origin}</div>
          </div>
          <div aria-hidden="true" style={{ flex: 1, textAlign: 'center', color: '#c99420', fontSize: 18 }}>✈ ─────</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...mono, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{IATA[offer.destination] || '???'}</div>
            <div style={{ fontSize: 11, color: '#7c86a0' }}>{offer.destination}</div>
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
        borderTop: '2px dashed #c3cadd', padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={label}>Confirmation ID</div>
          <div style={{ ...mono, fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>{confirmation_id}</div>
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
  const ready = from && to && date

  return (
    <form
      data-testid="trip-picker"
      onSubmit={e => { e.preventDefault(); onSearch(`Find flights from ${from} to ${to} on ${date}`) }}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, maxWidth: '95%' }}
    >
      <select className="styled-select" value={from} onChange={e => setFrom(e.target.value)} required
        aria-label="From city" style={{ width: 'auto', flex: '1 1 120px' }}>
        <option value="" disabled>From</option>
        {CITIES.map(c => <option key={c} value={c} disabled={c === to}>{c}</option>)}
      </select>
      <select className="styled-select" value={to} onChange={e => setTo(e.target.value)} required
        aria-label="To city" style={{ width: 'auto', flex: '1 1 120px' }}>
        <option value="" disabled>To</option>
        {CITIES.map(c => <option key={c} value={c} disabled={c === from}>{c}</option>)}
      </select>
      <input type="date" className="styled-input" value={date} min={today} onChange={e => setDate(e.target.value)} required
        aria-label="Travel date" style={{ colorScheme: 'dark', width: 'auto', flex: '1 1 140px' }} />
      <button type="submit" className="btn-amber" disabled={disabled || !ready}
        style={{ padding: '10px 20px', fontSize: 13 }}>
        Search
      </button>
    </form>
  )
}

function PassengerForm({ onSubmit, disabled }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <form
      data-testid="passenger-form"
      onSubmit={e => { e.preventDefault(); onSubmit(`Passenger is ${name.trim()}, email ${email.trim()}`) }}
      className="glass"
      style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, borderRadius: 12, maxWidth: '95%', flexShrink: 0 }}
    >
      <div className="mono-label" style={{ color: 'var(--amber)' }}>PASSENGER DETAILS</div>
      <input className="styled-input" value={name} onChange={e => setName(e.target.value)} required minLength={2}
        placeholder="Full name" aria-label="Passenger full name" />
      <input className="styled-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required
        placeholder="Email" aria-label="Passenger email" />
      <button type="submit" className="btn-amber" disabled={disabled || !name.trim() || !email.trim()}
        style={{ padding: '10px 20px', fontSize: 13 }}>
        Continue
      </button>
    </form>
  )
}

function OfferCard({ offer, onSelect, disabled }) {
  return (
    <div className="glass" data-testid="offer-card" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--panel-2)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--paper)' }}>
          {offer.airline.replace('_', ' ')}{' '}
          <span style={{ ...mono, color: 'var(--faint)', fontWeight: 400, fontSize: 12 }}>{offer.flight_id}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 3 }}>
          {offer.departure_time.replace('_', ' ')} · {offer.stops === 'zero' ? 'non-stop' : offer.stops === 'one' ? '1 stop' : '2+ stops'} · {offer.duration_hours}h · {offer.seats_left} seats left
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ ...mono, fontWeight: 700, fontSize: 15, color: 'var(--amber)' }}>
          ₹{offer.price_inr.toLocaleString('en-IN')}
        </span>
        <button onClick={() => onSelect(offer)} disabled={disabled} className="btn-amber"
          style={{ padding: '7px 14px', fontSize: 13 }}>
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
    <div className="glass" style={{ display: 'flex', flexDirection: 'column', height: 'min(72vh, 720px)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 18px', borderBottom: '1px solid var(--line)', background: 'var(--panel-2)',
      }}>
        <span className="mono-label" style={{ color: 'var(--amber)' }}>FLIGHT DESK</span>
        <span className="mono-label"><span className="blink" style={{ color: 'var(--ok)' }}>●</span> AGENT ONLINE</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.55,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(m.role === 'user'
                ? { marginLeft: 'auto', background: 'var(--amber)', color: 'var(--amber-ink)', fontWeight: 500, borderBottomRightRadius: 4 }
                : { marginRight: 'auto', background: 'var(--ink-2)', border: '1px solid var(--line)', color: 'var(--paper)', borderBottomLeftRadius: 4 }),
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
              background: 'var(--ok)', color: '#052e12',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--body)',
            }}
          >
            ✓ Confirm booking
          </button>
        )}

        {confirmed && (booking.offer ? (
          <Ticket booking={booking} />
        ) : (
          <div data-testid="booking-confirmed" style={{
            padding: '14px 18px', borderRadius: 12, flexShrink: 0,
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)',
            color: 'var(--ok)', fontSize: 14, fontWeight: 600,
          }}>
            ✅ Booking confirmed — ID {booking.confirmation_id}
            <div style={{ fontWeight: 400, fontSize: 12, opacity: 0.75, marginTop: 4 }}>
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
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={e => { e.preventDefault(); send(input) }}
        style={{ display: 'flex', gap: 10, padding: 16, borderTop: '1px solid var(--line)' }}
      >
        <input
          className="styled-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Try "find flights Delhi to Mumbai next Friday"'
          aria-label="Message the flight assistant"
          style={{ flex: 1, padding: '12px 16px' }}
        />
        <button type="submit" className="btn-amber" disabled={busy || !input.trim()}
          style={{ padding: '12px 22px' }}>
          Send
        </button>
      </form>
    </div>
  )
}
