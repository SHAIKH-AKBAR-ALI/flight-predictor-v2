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
  const confidenceLabel = confidenceRatio > 0.7 ? 'High' : confidenceRatio > 0.5 ? 'Medium' : 'Low'
  const confidenceColor = confidenceRatio > 0.7 ? '#22c55e' : confidenceRatio > 0.5 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      key={price}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="glass"
      style={{
        marginBottom: 20, padding: '40px 36px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 0 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300, height: 200,
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <p style={{
        fontSize: 11, color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14,
      }}>
        Predicted Price
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="gradient-text"
        style={{
          fontSize: 'clamp(2.8rem, 8vw, 4.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 20,
        }}
      >
        {INR.format(price)}
      </motion.div>

      {/* Confidence indicator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, maxWidth: 420, width: '100%',
        }}
      >
        {/* Confidence bar */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', fontWeight: 600, letterSpacing: '0.05em' }}>
            CONFIDENCE
          </span>
          <div style={{
            flex: 1, height: 5, borderRadius: 3,
            background: 'rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidenceRatio * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg, ${confidenceColor}88, ${confidenceColor})`,
              }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: confidenceColor, whiteSpace: 'nowrap' }}>
            {confidenceLabel}
          </span>
        </div>

        {/* Price range */}
        <div style={{
          padding: '10px 18px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          width: '100%',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            Likely between{' '}
            <span style={{ color: '#86efac', fontWeight: 700 }}>{fmt(low)}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', margin: '0 6px' }}>–</span>
            <span style={{ color: '#fca5a5', fontWeight: 700 }}>{fmt(high)}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6, fontSize: 11 }}>±MAE ₹1,368</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
