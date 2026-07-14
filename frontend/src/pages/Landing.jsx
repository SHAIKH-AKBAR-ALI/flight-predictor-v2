import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

// Real conversation from the agent's verification run — not marketing copy.
const DEMO_SCRIPT = [
  { role: 'user', text: 'find flights Delhi to Mumbai on July 25' },
  { role: 'assistant', text: '9 live options, cheapest first: AirAsia I5-439 at ₹8,145 (Early Morning, 1 stop)… Typical price for this route is ₹6,045, so today is running above usual.' },
  { role: 'user', text: 'book the cheapest one' },
  { role: 'assistant', text: 'AirAsia I5-439 it is. Passenger name and email?' },
  { role: 'user', text: 'Akbar Ali, akbar@example.com' },
  { role: 'assistant', text: 'Booked ✅ Confirmation FLA119AEAF — Delhi → Mumbai, Jul 25, ₹8,145.' },
]

const FEATURES = [
  {
    title: 'Book by conversation',
    body: 'Tell the agent where you\'re going. It searches live options, compares them, and books — across as many follow-ups as you need.',
  },
  {
    title: 'Knows a fair price',
    body: 'A Random Forest model trained on 300k+ Indian domestic fares tells you whether today\'s price is above or below typical for the route.',
  },
  {
    title: 'Explains the why',
    body: 'SHAP breaks every estimate into the factors that moved it — days left, airline, stops — narrated in plain English by Llama 3.3.',
  },
  {
    title: 'Booking you can inspect',
    body: 'Every quote, session, and confirmation is persisted to Supabase. Mock payments only — this is a portfolio build, not a travel agency.',
  },
]

const STACK = ['FastAPI', 'React', 'Groq · Llama 3.3 70B', 'scikit-learn', 'SHAP', 'Supabase', 'Docker', 'Playwright']

function DemoChat() {
  const [shown, setShown] = useState(1)
  useEffect(() => {
    if (shown >= DEMO_SCRIPT.length) return
    const t = setTimeout(() => setShown(s => s + 1), shown % 2 ? 900 : 1600)
    return () => clearTimeout(t)
  }, [shown])

  return (
    <div className="glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 380 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
        Replay · real session, real confirmation ID
      </div>
      {DEMO_SCRIPT.slice(0, shown).map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '88%', padding: '9px 13px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
            ...(m.role === 'user'
              ? { marginLeft: 'auto', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', borderBottomRightRadius: 4 }
              : { marginRight: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', borderBottomLeftRadius: 4 }),
          }}>
          {m.text}
        </motion.div>
      ))}
    </div>
  )
}

export default function Landing() {
  return (
    <div style={{ paddingTop: 56 }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        maxWidth: 1100, margin: '0 auto', padding: '72px 24px 56px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center',
      }}>
        <div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: 'clamp(2.3rem, 5vw, 3.6rem)', lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: 20,
            }}>
            The flight agent that
            <br />
            <span className="gradient-text">knows what a fair price is.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', maxWidth: 440, marginBottom: 32 }}>
            An AI booking agent for Indian domestic flights, backed by an ML model trained on 300,000+ real fares.
            It searches, compares against what the route usually costs, explains the difference, and books.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#/app" data-testid="cta-app" style={{
              padding: '13px 26px', borderRadius: 10, textDecoration: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', fontWeight: 600, fontSize: 15,
              boxShadow: '0 4px 24px rgba(124,58,237,0.35)',
            }}>
              Try the agent →
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
              padding: '13px 26px', borderRadius: 10, textDecoration: 'none',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: 15,
            }}>
              View source
            </a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <DemoChat />
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="glass" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, marginBottom: 10, color: '#fff' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)' }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 96px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
          Built with
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STACK.map(t => (
            <span key={t} style={{
              padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.55)',
            }}>
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
