import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../api/client'

const AIRLINE_ICONS = {
  AirAsia: '🔴', Air_India: '🇮🇳', GO_FIRST: '🔵', Indigo: '🟣', SpiceJet: '🌶️', Vistara: '🟡',
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

  if (!sessionRef.current) {
    sessionRef.current = sessionStorage.getItem('chat_session') || crypto.randomUUID()
    sessionStorage.setItem('chat_session', sessionRef.current)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, offers, busy])

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

        {confirmed && (
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
        )}

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
