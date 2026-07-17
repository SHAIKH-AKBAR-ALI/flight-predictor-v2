import { motion } from 'framer-motion'

const GITHUB = 'https://github.com/SHAIKH-AKBAR-ALI/flight-predictor-v2'

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        background: 'rgba(10,16,32,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <span aria-hidden="true" style={{
          fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 13,
          background: 'var(--amber)', color: 'var(--amber-ink)',
          padding: '3px 7px', borderRadius: 6, letterSpacing: '0.04em',
        }}>
          FF
        </span>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em', color: 'var(--paper)' }}>
          FairFare
        </span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="#/app" className="btn-amber" style={{ padding: '7px 16px', fontSize: 13 }}>
          Open app
        </a>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer"
          className="btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </motion.nav>
  )
}
