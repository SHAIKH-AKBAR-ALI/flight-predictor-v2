import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ChatPanel from '../components/ChatPanel'
import PredictionForm from '../components/PredictionForm'
import ResultCard from '../components/ResultCard'
import SHAPChart from '../components/SHAPChart'
import AIExplanation from '../components/AIExplanation'
import HistoryTable from '../components/HistoryTable'
import api from '../api/client'

const TABS = [
  { id: 'agent', label: 'AI booking agent' },
  { id: 'estimate', label: 'Price estimate · historical data' },
]

export default function AppPage() {
  const [tab, setTab] = useState('agent')
  const [prediction, setPrediction] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState({ predict: false, explain: false })
  const [error, setError] = useState(null)

  const fetchHistory = () => {
    api.get('/history').then(r => setHistory(r.data)).catch(() => {})
  }

  useEffect(() => { fetchHistory() }, [])

  const scrollToResult = () =>
    setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)

  const handlePredict = async (formData) => {
    setLoading(l => ({ ...l, predict: true }))
    setError(null)
    try {
      const { data } = await api.post('/predict', formData)
      setPrediction(data)
      setExplanation(null)
      fetchHistory()
      scrollToResult()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Prediction failed')
    } finally {
      setLoading(l => ({ ...l, predict: false }))
    }
  }

  const handleExplain = async (formData) => {
    setLoading(l => ({ ...l, explain: true }))
    setError(null)
    try {
      const { data } = await api.post('/explain', formData)
      setPrediction({ predicted_price: data.predicted_price, currency: data.currency })
      setExplanation(data)
      fetchHistory()
      scrollToResult()
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Explanation failed')
    } finally {
      setLoading(l => ({ ...l, explain: false }))
    }
  }

  return (
    <div style={{ paddingTop: 56 }}>
      <Navbar />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 0' }}>
        <div role="tablist" aria-label="App mode" style={{
          display: 'inline-flex', gap: 4, padding: 4, borderRadius: 12, marginBottom: 24,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {TABS.map(t => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                ...(tab === t.id
                  ? { background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }
                  : { background: 'transparent', color: 'rgba(255,255,255,0.5)' }),
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'agent' && (
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 80px' }}>
          <ChatPanel />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 12, lineHeight: 1.5 }}>
            Live prices come from a mock inventory; bookings are simulated — no payment, no real ticket.
            Typical-price comparisons use a model trained on historical fares.
          </p>
        </section>
      )}

      {tab === 'estimate' && (
        <>
          <section id="predict" style={{ padding: '0 16px 40px', maxWidth: 860, margin: '0 auto' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.6 }}>
              Estimates what a route typically costs, based on historical fare data — not a live bookable price.
            </p>
            <PredictionForm onPredict={handlePredict} onExplain={handleExplain} loading={loading} />
            {error && (
              <div style={{
                marginTop: 16, padding: '12px 18px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, color: '#fca5a5', fontSize: 14, lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}
          </section>

          {(prediction || explanation) && (
            <section id="result" style={{ padding: '0 16px 60px', maxWidth: 860, margin: '0 auto' }}>
              {prediction && <ResultCard price={prediction.predicted_price} />}
              {explanation && (
                <>
                  <SHAPChart featureImportance={explanation.feature_importance} />
                  <AIExplanation text={explanation.ai_explanation} />
                </>
              )}
            </section>
          )}

          <section style={{ padding: '0 16px 120px', maxWidth: 1100, margin: '0 auto' }}>
            <HistoryTable history={history} />
          </section>
        </>
      )}
    </div>
  )
}
