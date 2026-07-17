import { motion } from 'framer-motion'

const MAE = 1368

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
})

function fmt(n) {
  return INR.format(Math.max(0, Math.round(n)))
}

export default function ResultCard({ price }) {
  const low = Math.max(0, price - MAE)
  const high = price + MAE
  const confidenceRatio = Math.max(0.2, Math.min(0.92, 1 - (MAE / price) * 0.65))
  const confidenceLabel = confidenceRatio > 0.7 ? 'HIGH' : confidenceRatio > 0.5 ? 'MEDIUM' : 'LOW'
  const confidenceColor = confidenceRatio > 0.7 ? 'var(--ok)' : confidenceRatio > 0.5 ? 'var(--amber)' : 'var(--hot)'
  const digits = INR.format(price)

  return (
    <motion.div
      key={price}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="glass"
      style={{ marginBottom: 20, padding: '40px 36px', textAlign: 'center', background: 'var(--panel-2)' }}
    >
      <p className="mono-label" style={{ color: 'var(--amber)', marginBottom: 18 }}>
        TYPICAL FARE · HISTORICAL ESTIMATE
      </p>

      {/* split-flap price */}
      <div style={{
        display: 'inline-flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center',
      }} aria-label={digits}>
        {digits.split('').map((ch, i) => (
          <span key={`${price}-${i}`} className="flap-char" aria-hidden="true" style={{
            animationDelay: `${i * 55}ms`,
            fontFamily: 'var(--mono)', fontWeight: 700,
            fontSize: 'clamp(2.2rem, 6.5vw, 3.6rem)', lineHeight: 1.15,
            color: 'var(--amber)', background: 'var(--ink)',
            border: '1px solid var(--line)', borderRadius: 8,
            padding: '0.05em 0.14em', minWidth: ch === ',' || ch === '₹' ? 'auto' : '0.85em',
          }}>
            {ch}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, maxWidth: 420, width: '100%',
        }}
      >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono-label" style={{ whiteSpace: 'nowrap' }}>CONFIDENCE</span>
          <div style={{
            flex: 1, height: 5, borderRadius: 3,
            background: 'var(--line)',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidenceRatio * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 3, background: confidenceColor }}
            />
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: confidenceColor, whiteSpace: 'nowrap' }}>
            {confidenceLabel}
          </span>
        </div>

        <div style={{
          padding: '10px 18px', borderRadius: 10,
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          width: '100%',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--dim)', lineHeight: 1.5 }}>
            Likely between{' '}
            <span style={{ color: 'var(--ok)', fontWeight: 700, fontFamily: 'var(--mono)' }}>{fmt(low)}</span>
            <span style={{ color: 'var(--faint)', margin: '0 6px' }}>–</span>
            <span style={{ color: 'var(--hot)', fontWeight: 700, fontFamily: 'var(--mono)' }}>{fmt(high)}</span>
            <span style={{ color: 'var(--faint)', marginLeft: 6, fontSize: 11 }}>±MAE ₹1,368</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
