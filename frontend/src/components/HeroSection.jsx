import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const scrollDown = () =>
    document.getElementById('predict')?.scrollIntoView({ behavior: 'smooth' })

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 5.3 + 7) % 100,
      y: (i * 13.7 + 3) % 100,
      size: (i % 3) + 1.5,
      duration: 6 + (i % 5) * 2,
      delay: -(i * 0.7),
      opacity: 0.12 + (i % 3) * 0.08,
      color: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#2563eb' : '#a78bfa',
    })), [])

  return (
    <section style={{
      position: 'relative',
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 24px 40px',
      overflow: 'hidden',
    }}>
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -30, 0],
            x: [0, p.id % 2 === 0 ? 8 : -8, 0],
            opacity: [p.opacity, p.opacity * 1.6, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            pointerEvents: 'none',
            filter: p.size > 3 ? 'blur(1px)' : 'none',
          }}
        />
      ))}

      {/* Floating plane */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 56, marginBottom: 20, filter: 'drop-shadow(0 0 24px rgba(124,58,237,0.4))' }}
      >
        ✈️
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <h1 style={{
          fontSize: 'clamp(2.2rem, 6vw, 4rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}>
          <span className="gradient-text">AI Flight Price</span>
          <br />
          <span style={{ color: '#fff' }}>Intelligence</span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: 420,
          lineHeight: 1.6,
          marginBottom: 28,
          fontWeight: 400,
        }}
      >
        Predict prices. Understand why. Book smarter.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}
      >
        {['🤖 SHAP Explanations', '📊 Feature Importance', '🇮🇳 Indian Airlines'].map(tag => (
          <span key={tag} style={{
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500,
          }}>
            {tag}
          </span>
        ))}
      </motion.div>

      <motion.button
        onClick={scrollDown}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        aria-label="Scroll down"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.button>
    </section>
  )
}
