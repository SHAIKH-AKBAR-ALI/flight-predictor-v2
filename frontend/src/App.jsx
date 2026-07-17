import { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import AppPage from './pages/AppPage'

// ponytail: hash routing, react-router when a third page appears
export default function App() {
  const [hash, setHash] = useState(window.location.hash)

  // ponytail: pre-warm Render free-tier backend (~50s cold start) while user reads/types
  useEffect(() => { fetch('/health').catch(() => {}) }, [])

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0a0a0f', minHeight: '100vh' }}>
      {hash.startsWith('#/app') ? <AppPage /> : <Landing />}
    </div>
  )
}
