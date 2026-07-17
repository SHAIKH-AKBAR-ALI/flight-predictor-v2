import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AIExplanation({ text }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!text) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, 16)
    return () => clearInterval(id)
  }, [text])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass"
      style={{ marginBottom: 20, padding: '32px 36px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: 'var(--amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          🤖
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--display)' }}>AI Explanation</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)' }}>
              Llama 3.3 70B
            </p>
            <span style={{
              padding: '2px 7px', borderRadius: 5,
              background: 'rgba(247,127,0,0.15)',
              border: '1px solid rgba(247,127,0,0.35)',
              color: '#fb923c',
              fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
              lineHeight: 1,
            }}>
              GROQ
            </span>
          </div>
        </div>
        {done && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginLeft: 'auto', fontSize: 11, padding: '4px 10px', borderRadius: 100,
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
              color: 'var(--ok)', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            ✓ Done
          </motion.span>
        )}
      </div>

      {/* Typewriter text */}
      <p style={{
        margin: 0, fontSize: 15, lineHeight: 1.75,
        color: 'var(--paper)', fontWeight: 400,
      }}>
        {displayed}
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.65, repeat: Infinity }}
            style={{
              display: 'inline-block', width: 2, height: '1.1em',
              background: 'var(--amber)', marginLeft: 2,
              verticalAlign: 'text-bottom', borderRadius: 1,
            }}
          />
        )}
      </p>
    </motion.div>
  )
}
