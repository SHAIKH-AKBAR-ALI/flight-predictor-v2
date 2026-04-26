import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PredictionForm from './components/PredictionForm'
import ResultCard from './components/ResultCard'
import SHAPChart from './components/SHAPChart'
import AIExplanation from './components/AIExplanation'
import HistoryTable from './components/HistoryTable'
import api from './api/client'

export default function App() {
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
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />

      {/* paddingTop offsets fixed navbar */}
      <div style={{ paddingTop: 56 }}>
        <HeroSection />

        <section id="predict" style={{ padding: '60px 16px 40px', maxWidth: 860, margin: '0 auto' }}>
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
      </div>
    </div>
  )
}
