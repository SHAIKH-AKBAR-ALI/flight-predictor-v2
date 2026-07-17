import { motion } from 'framer-motion'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
  } catch { return iso }
}

const TH = ({ children }) => (
  <th className="mono-label" style={{
    padding: '13px 18px', textAlign: 'left',
    borderBottom: '1px solid var(--line)',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </th>
)

const TD = ({ children, style }) => (
  <td style={{
    padding: '13px 18px', fontSize: 13,
    borderBottom: '1px solid rgba(208,222,255,0.04)',
    color: 'var(--dim)', ...style,
  }}>
    {children}
  </td>
)

function ClassBadge({ value }) {
  const isBiz = value === 'Business'
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
      background: isBiz ? 'var(--amber-dim)' : 'var(--ink-2)',
      color: isBiz ? 'var(--amber)' : 'var(--dim)',
      border: `1px solid ${isBiz ? 'rgba(255,179,36,0.3)' : 'var(--line-strong)'}`,
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  )
}

function Sparkline({ prices, highlightIdx }) {
  const w = 64, h = 28
  if (prices.length < 2) {
    return (
      <svg width={w} height={h}>
        <circle cx={w / 2} cy={h / 2} r={3} fill="#ffb324" opacity={0.7} />
      </svg>
    )
  }
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const pad = 4

  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (w - pad * 2)
    const y = h - pad - ((p - min) / range) * (h - pad * 2)
    return [x, y]
  })

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const [hx, hy] = pts[Math.min(highlightIdx, pts.length - 1)] || pts[pts.length - 1]

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline
        points={polyline}
        fill="none"
        stroke="rgba(255,179,36,0.35)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={hx} cy={hy} r={3} fill="#ffb324" opacity={0.9} />
    </svg>
  )
}

export default function HistoryTable({ history }) {
  const chronoPrices = [...history].reverse().map(h => h.predicted_price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Recent estimates</h2>
        {history.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--faint)' }}>last {history.length}</span>
        )}
      </div>
      <p style={{ color: 'var(--faint)', fontSize: 13, marginBottom: 20 }}>
        Every estimate is logged to Supabase — this is the live table.
      </p>

      {!history.length ? (
        <div className="glass" style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--faint)', fontSize: 14 }}>
          No predictions yet. Make your first prediction above. ✈️
        </div>
      ) : (
        <div className="glass" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <TH>Time</TH>
                <TH>Route</TH>
                <TH>Airline</TH>
                <TH>Class</TH>
                <TH>Stops</TH>
                <TH>Trend</TH>
                <TH>Price</TH>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => {
                const isOdd = i % 2 !== 0
                const rowBg = isOdd ? 'rgba(208,222,255,0.015)' : 'transparent'
                const hoverBg = 'rgba(255,179,36,0.06)'
                const highlightIdx = chronoPrices.length - 1 - i

                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    style={{ background: rowBg, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}
                  >
                    <TD style={{ color: 'var(--faint)', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {formatTime(row.created_at)}
                    </TD>
                    <TD>
                      <span style={{ fontWeight: 600, color: 'var(--paper)' }}>{row.source_city}</span>
                      <span style={{ color: 'var(--faint)', margin: '0 7px', fontSize: 12 }}>→</span>
                      <span style={{ fontWeight: 600, color: 'var(--paper)' }}>{row.destination_city}</span>
                    </TD>
                    <TD>{row.airline?.replace(/_/g, ' ')}</TD>
                    <TD><ClassBadge value={row['class']} /></TD>
                    <TD style={{ color: 'var(--dim)', fontSize: 12 }}>
                      {row.stops?.replace(/_/g, ' ') || '—'}
                    </TD>
                    <TD>
                      <Sparkline prices={chronoPrices} highlightIdx={highlightIdx} />
                    </TD>
                    <TD style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--amber)' }}>
                        {INR.format(row.predicted_price)}
                      </span>
                    </TD>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
