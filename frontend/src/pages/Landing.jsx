import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const GITHUB = 'https://github.com/SHAIKH-AKBAR-ALI/flight-predictor-v2'

/* ── Split-flap departure board (signature) ─────────────────────── */

const BOARD_ROWS = [
  [
    { flight: '6E-222', route: 'DEL → BOM', fare: '₹5,955', verdict: 'FAIR', tone: 'ok' },
    { flight: 'I5-439', route: 'DEL → BOM', fare: '₹8,145', verdict: '+₹2,100', tone: 'hot' },
  ],
  [
    { flight: 'UK-810', route: 'BLR → DEL', fare: '₹7,420', verdict: '-₹640', tone: 'ok' },
    { flight: 'SG-118', route: 'BLR → DEL', fare: '₹9,980', verdict: '+₹1,920', tone: 'hot' },
  ],
  [
    { flight: 'AI-506', route: 'CCU → MAA', fare: '₹6,210', verdict: 'FAIR', tone: 'ok' },
    { flight: 'G8-327', route: 'CCU → MAA', fare: '₹5,480', verdict: '-₹730', tone: 'ok' },
  ],
  [
    { flight: '6E-871', route: 'HYD → DEL', fare: '₹4,890', verdict: '-₹1,155', tone: 'ok' },
    { flight: 'UK-994', route: 'HYD → DEL', fare: '₹11,300', verdict: '+₹3,400', tone: 'hot' },
  ],
]

function FlapText({ text, color }) {
  // key on text: every change re-mounts chars and replays the flap
  return (
    <span style={{ color }}>
      {text.split('').map((ch, i) => (
        <span key={`${text}-${i}`} className="flap-char" style={{ animationDelay: `${i * 28}ms` }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

function DepartureBoard() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="board" role="img" aria-label="Departure board comparing live fares to typical prices">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', background: 'rgba(255,179,36,0.06)',
      }}>
        <span className="mono-label" style={{ color: 'var(--amber)' }}>DEPARTURES · FARE CHECK</span>
        <span className="mono-label"><span className="blink" style={{ color: 'var(--ok)' }}>●</span> LIVE</span>
      </div>
      <div className="board-row" style={{ borderTop: 'none', padding: '9px 18px' }}>
        {['FLIGHT', 'ROUTE', 'FARE', 'VS TYPICAL'].map(h => (
          <span key={h} className="mono-label">{h}</span>
        ))}
      </div>
      {BOARD_ROWS.map((alts, r) => {
        const row = alts[tick % alts.length]
        return (
          <div key={r} className="board-row">
            <FlapText text={row.flight} color="var(--paper)" />
            <FlapText text={row.route} color="var(--dim)" />
            <FlapText text={row.fare} color="var(--amber)" />
            <FlapText text={row.verdict} color={row.tone === 'ok' ? 'var(--ok)' : 'var(--hot)'} />
          </div>
        )
      })}
      <div style={{ padding: '10px 18px', borderTop: '1px solid var(--line)' }}>
        <span className="mono-label">TYPICAL = RANDOM FOREST · 300,153 HISTORICAL FARES</span>
      </div>
    </div>
  )
}

/* ── India route radar (SVG, no external image) ─────────────────── */

const CITY_XY = {
  DEL: [153, 89], BOM: [82, 245], BLR: [160, 345],
  CCU: [340, 187], HYD: [175, 273], MAA: [205, 344],
}
const CITY_NAMES = { DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bangalore', CCU: 'Kolkata', HYD: 'Hyderabad', MAA: 'Chennai' }
const ARCS = [['DEL', 'BOM'], ['DEL', 'CCU'], ['DEL', 'BLR'], ['BOM', 'BLR'], ['BOM', 'MAA'], ['CCU', 'MAA'], ['HYD', 'DEL'], ['HYD', 'MAA']]

function arcPath([x1, y1], [x2, y2]) {
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.18
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.18
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}

function RouteRadar() {
  return (
    <svg viewBox="0 0 400 430" style={{ width: '100%', maxWidth: 460, display: 'block', margin: '0 auto' }}
      role="img" aria-label="Route map of the six covered Indian metros">
      {[70, 130, 190].map(r => (
        <circle key={r} cx="190" cy="230" r={r} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {ARCS.map(([a, b], i) => (
        <path key={i} d={arcPath(CITY_XY[a], CITY_XY[b])} fill="none" strokeWidth="1.4"
          className="radar-arc" style={{ animationDelay: `${i * -0.3}s`, opacity: 0.55 }} />
      ))}
      {Object.entries(CITY_XY).map(([code, [x, y]]) => {
        const left = code === 'CCU' || code === 'BLR' // keep labels clear of neighbors
        return (
          <g key={code}>
            <circle cx={x} cy={y} r="10" fill="var(--amber)" opacity="0.12" />
            <circle cx={x} cy={y} r="3.5" fill="var(--amber)" />
            <text x={x + (left ? -14 : 14)} y={y + 4} textAnchor={left ? 'end' : 'start'}
              fontFamily="B612 Mono, monospace" fontSize="13" fontWeight="700" fill="var(--paper)">
              {code}
            </text>
            <text x={x + (left ? -14 : 14)} y={y + 18} textAnchor={left ? 'end' : 'start'}
              fontFamily="B612 Mono, monospace" fontSize="9" fill="var(--faint)">
              {CITY_NAMES[code]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Demo replay — real conversation from the verification run ──── */

const DEMO_SCRIPT = [
  { role: 'user', text: 'find flights Delhi to Mumbai on July 25' },
  { role: 'assistant', text: '9 live options, cheapest first: AirAsia I5-439 at ₹8,145 (Early Morning, 1 stop)… Typical price for this route is ₹6,045, so today is running above usual.' },
  { role: 'user', text: 'book the cheapest one' },
  { role: 'assistant', text: 'AirAsia I5-439 it is. Passenger name and email?' },
  { role: 'user', text: 'Akbar Ali, akbar@example.com' },
  { role: 'assistant', text: 'Booked ✅ Confirmation FLA119AEAF — Delhi → Mumbai, Jul 25, ₹8,145.' },
]

function DemoChat() {
  const [shown, setShown] = useState(0)
  return (
    <motion.div className="glass"
      onViewportEnter={() => shown === 0 && setShown(1)}
      viewport={{ once: true, margin: '-100px' }}
      style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 380 }}>
      <span className="mono-label" style={{ marginBottom: 6 }}>REPLAY · REAL SESSION, REAL CONFIRMATION ID</span>
      {DEMO_SCRIPT.slice(0, shown).map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onAnimationComplete={() => i === shown - 1 && shown < DEMO_SCRIPT.length &&
            setTimeout(() => setShown(s => Math.max(s, i + 2)), m.role === 'user' ? 700 : 1400)}
          style={{
            maxWidth: '88%', padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.55,
            ...(m.role === 'user'
              ? { marginLeft: 'auto', background: 'var(--amber)', color: 'var(--amber-ink)', fontWeight: 500, borderBottomRightRadius: 4 }
              : { marginRight: 'auto', background: 'var(--ink-2)', border: '1px solid var(--line)', color: 'var(--dim)', borderBottomLeftRadius: 4 }),
          }}>
          {m.text}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ── Content ────────────────────────────────────────────────────── */

const STEPS = [
  { n: '01', title: 'Ask', body: 'Tell the agent where you\'re going, in plain language. It asks for whatever is missing — no forms, no filters.' },
  { n: '02', title: 'Compare', body: 'Live options land next to what the route usually costs, so "₹8,145" becomes "₹2,100 above typical". You decide with context.' },
  { n: '03', title: 'Book', body: 'Pick a flight, confirm, get a boarding pass with a stored confirmation ID. Payment is simulated — this is a portfolio build.' },
]

const FEATURES = [
  { title: 'Book by conversation', body: 'A LangGraph agent on Groq searches live options, refines on feedback ("anything cheaper?"), and books — across as many follow-ups as you need.' },
  { title: 'Knows a fair price', body: 'A Random Forest trained on 300,000+ Indian domestic fares says whether today\'s price is above or below typical for the route.' },
  { title: 'Explains the why', body: 'SHAP splits every estimate into the factors that moved it — days left, airline, stops — narrated in plain English by Llama 3.3.' },
  { title: 'Everything inspectable', body: 'Every quote, session, and confirmation persists to Supabase. Open the history tab and audit what the model said.' },
]

const FAQS = [
  { q: 'Are these real bookings?', a: 'No. Flights come from a deterministic mock inventory and payment is simulated — no money moves and no ticket is issued. Confirmation IDs are real database rows though: every booking is stored in Supabase and shown on a mock boarding pass.' },
  { q: 'Where does "typical price" come from?', a: 'A Random Forest model trained on 300,000+ historical Indian domestic fares. It estimates what a route usually costs given airline, class, stops, and days until departure. It is historical context only — never a bookable price.' },
  { q: 'Why is the live fare different from the typical price?', a: 'Live fares move with demand and how close departure is; the typical price is the long-run average for that kind of trip. The gap between them is the point — it tells you whether today is a good day to buy.' },
  { q: 'Why does the first reply take a moment?', a: 'The backend runs on a free tier that sleeps when idle and takes up to a minute to wake. The page pings it the moment you arrive, so it is usually warm by the time you send your first message.' },
  { q: 'What is this built with?', a: 'FastAPI + LangGraph agent on Groq (gpt-oss-120b), scikit-learn Random Forest with SHAP explainability, Supabase for persistence, React + Framer Motion up front, Playwright for end-to-end tests. Full source on GitHub.' },
]

const STACK = ['FastAPI', 'LangGraph', 'Groq', 'scikit-learn', 'SHAP', 'Supabase', 'React', 'Playwright']

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const displayFont = { fontFamily: 'var(--display)', fontWeight: 800, letterSpacing: '-0.02em' }

function SectionTitle({ eyebrow, children }) {
  return (
    <motion.div {...reveal} style={{ marginBottom: 36 }}>
      <div className="mono-label" style={{ color: 'var(--amber)', marginBottom: 12 }}>{eyebrow}</div>
      <h2 style={{ ...displayFont, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', lineHeight: 1.1 }}>{children}</h2>
    </motion.div>
  )
}

export default function Landing() {
  return (
    <div style={{ paddingTop: 56 }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        maxWidth: 1140, margin: '0 auto', padding: '76px 24px 48px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 52, alignItems: 'center',
      }}>
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            className="mono-label" style={{ color: 'var(--amber)', marginBottom: 18 }}>
            AI BOOKING AGENT · INDIAN DOMESTIC · 6 METROS
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ ...displayFont, fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', lineHeight: 1.02, marginBottom: 22 }}>
            The agent that knows
            <br />
            <span style={{ color: 'var(--amber)' }}>what a fair fare is.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--dim)', maxWidth: 460, marginBottom: 32 }}>
            Ask for a flight in plain language. It searches live options, checks each fare against
            300,000+ historical prices, explains the difference, and books — in one conversation.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="#/app" data-testid="cta-app" className="btn-amber">Try the agent →</a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-ghost">View source</a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <DepartureBoard />
        </motion.div>
      </section>

      {/* Stat strip */}
      <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{
          maxWidth: 1140, margin: '0 auto', padding: '18px 24px',
          display: 'flex', flexWrap: 'wrap', gap: '12px 40px', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--dim)',
        }}>
          <span><b style={{ color: 'var(--amber)' }}>300K+</b> FARES LEARNED</span>
          <span><b style={{ color: 'var(--amber)' }}>±₹1,368</b> MODEL MAE</span>
          <span><b style={{ color: 'var(--amber)' }}>6</b> METROS · <b style={{ color: 'var(--amber)' }}>6</b> AIRLINES</span>
          <span><b style={{ color: 'var(--amber)' }}>4</b> AGENT TOOLS</span>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '88px 24px 0' }}>
        <SectionTitle eyebrow="HOW IT WORKS">One conversation, start to boarding pass.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.n} {...reveal} transition={{ ...reveal.transition, delay: i * 0.12 }}
              className="glass" style={{ padding: 26, position: 'relative', overflow: 'hidden' }}>
              {/* boarding-pass notch */}
              <div aria-hidden="true" style={{
                position: 'absolute', right: -9, top: '50%', width: 18, height: 18, borderRadius: '50%',
                background: 'var(--ink)', border: '1px solid var(--line)', transform: 'translateY(-50%)',
              }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--amber)', marginBottom: 14 }}>{s.n}</div>
              <h3 style={{ ...displayFont, fontSize: 21, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--dim)' }}>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Route radar + demo replay */}
      <section style={{
        maxWidth: 1140, margin: '0 auto', padding: '88px 24px 0',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 52, alignItems: 'center',
      }}>
        <motion.div {...reveal}>
          <div className="mono-label" style={{ color: 'var(--amber)', marginBottom: 12 }}>COVERAGE</div>
          <h2 style={{ ...displayFont, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', lineHeight: 1.1, marginBottom: 16 }}>
            Six metros, every pairing.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--dim)', maxWidth: 440, marginBottom: 24 }}>
            Delhi, Mumbai, Bangalore, Kolkata, Hyderabad, Chennai — the routes the model
            learned from 300,000+ real fares. Ask for any pairing, any date, either class.
          </p>
          <DemoChat />
        </motion.div>
        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }}>
          <RouteRadar />
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '88px 24px 0' }}>
        <SectionTitle eyebrow="UNDER THE HOOD">Not a wrapper. A system.</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}
              className="glass" style={{ padding: 26 }}>
              <h3 style={{ ...displayFont, fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--dim)' }}>{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '88px 24px 0' }}>
        <SectionTitle eyebrow="QUESTIONS">Before you ask the agent.</SectionTitle>
        <motion.div {...reveal}>
          {FAQS.map(f => (
            <details key={f.q} className="faq">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </motion.div>
      </section>

      {/* CTA + footer */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 72px', textAlign: 'center' }}>
        <motion.div {...reveal}>
          <h2 style={{ ...displayFont, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', lineHeight: 1.1, marginBottom: 24 }}>
            Now boarding.
          </h2>
          <a href="#/app" className="btn-amber" style={{ fontSize: 15, padding: '15px 32px' }}>
            Open the agent →
          </a>
        </motion.div>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)' }}>
        <div style={{
          maxWidth: 1140, margin: '0 auto', padding: '28px 24px',
          display: 'flex', flexWrap: 'wrap', gap: '14px 24px', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STACK.map(t => (
              <span key={t} style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.05em',
                padding: '5px 12px', borderRadius: 100,
                border: '1px solid var(--line)', color: 'var(--faint)',
              }}>
                {t}
              </span>
            ))}
          </div>
          <span className="mono-label">
            MOCK BOOKINGS · PORTFOLIO BUILD · <a href={GITHUB} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--amber)', textDecoration: 'none' }}>GITHUB ↗</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
