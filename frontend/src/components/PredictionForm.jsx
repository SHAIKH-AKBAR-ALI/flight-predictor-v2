import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AIRLINES = ['AirAsia', 'Air_India', 'GO_FIRST', 'Indigo', 'SpiceJet', 'Vistara']
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Chennai']
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Early_Morning', 'Late_Night']
const STOPS_OPTIONS = ['zero', 'one', 'two_or_more']
const CLASSES = ['Economy', 'Business']

const defaultForm = {
  airline: 'Indigo',
  source_city: 'Delhi',
  destination_city: 'Mumbai',
  departure_time: 'Morning',
  arrival_time: 'Afternoon',
  stops: 'zero',
  class: 'Economy',
  duration: 2,
  days_left: 15,
}

function Label({ icon, children, rightSlot }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
      <span className="mono-label" style={{ color: 'var(--dim)' }}>
        {icon}&nbsp; {children}
      </span>
      {rightSlot}
    </div>
  )
}

function SelectField({ label, icon, value, onChange, options }) {
  return (
    <div>
      <Label icon={icon}>{label}</Label>
      <select className="styled-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => (
          <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
        ))}
      </select>
    </div>
  )
}

function SliderField({ label, icon, value, onChange, min, max, unit }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <Label icon={icon} rightSlot={
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>
          {value} {unit}
        </span>
      }>
        {label}
      </Label>
      <div style={{ position: 'relative', paddingTop: 4 }}>
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          height: 4, width: `${pct}%`, borderRadius: 2,
          background: 'var(--amber)',
          pointerEvents: 'none',
        }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--faint)', marginTop: 5 }}>
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
      style={{
        width: 15, height: 15, flexShrink: 0,
        border: '2px solid currentColor', opacity: 0.8,
        borderTopColor: 'transparent', borderRadius: '50%',
      }}
    />
  )
}

function RouteConnector({ from, to }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, paddingBottom: 2 }}>
      <span className="mono-label" style={{ fontSize: 9 }}>route</span>
      <motion.div
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'var(--amber-dim)',
          border: '1px solid rgba(255,179,36,0.3)',
          borderRadius: 20,
          padding: '6px 12px',
        }}
      >
        <div style={{ width: 14, height: 1.5, background: 'linear-gradient(90deg, transparent, rgba(255,179,36,0.5))' }} />
        <span style={{ fontSize: 15 }}>✈️</span>
        <div style={{ width: 14, height: 1.5, background: 'linear-gradient(90deg, rgba(255,179,36,0.5), transparent)' }} />
      </motion.div>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)', fontWeight: 400,
        whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {from} → {to}
      </span>
    </div>
  )
}

export default function PredictionForm({ onPredict, onExplain, loading }) {
  const [form, setForm] = useState(defaultForm)
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const busy = loading.predict || loading.explain
  const payload = () => ({ ...form, duration: Number(form.duration), days_left: Number(form.days_left) })

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
      className="glass"
      style={{ padding: 'clamp(24px, 4vw, 44px)' }}
    >
      <h2 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.01em' }}>
        What does this trip <span style={{ color: 'var(--amber)' }}>usually cost?</span>
      </h2>
      <p style={{ color: 'var(--dim)', fontSize: 14, marginBottom: 32 }}>
        Describe the trip and the model estimates its typical fare from historical data.
      </p>

      {/* Airline */}
      <div style={{ marginBottom: 18 }}>
        <SelectField label="Airline" icon="✈" value={form.airline} onChange={set('airline')} options={AIRLINES} />
      </div>

      {/* Route visual: FROM → plane → TO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        alignItems: 'end',
        marginBottom: 18,
      }}>
        <SelectField label="From" icon="🛫" value={form.source_city} onChange={set('source_city')} options={CITIES} />
        <RouteConnector from={form.source_city} to={form.destination_city} />
        <SelectField label="To" icon="🛬" value={form.destination_city} onChange={set('destination_city')} options={CITIES} />
      </div>

      {/* Times row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 18 }}>
        <SelectField label="Departure Time" icon="🌅" value={form.departure_time} onChange={set('departure_time')} options={TIMES} />
        <SelectField label="Arrival Time" icon="🌆" value={form.arrival_time} onChange={set('arrival_time')} options={TIMES} />
        <SelectField label="Stops" icon="🔄" value={form.stops} onChange={set('stops')} options={STOPS_OPTIONS} />
        <SelectField label="Class" icon="💺" value={form.class} onChange={set('class')} options={CLASSES} />
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28, marginBottom: 36 }}>
        <SliderField label="Flight Duration" icon="⏱" value={form.duration} onChange={set('duration')} min={1} max={24} unit="hrs" />
        <SliderField label="Days Until Departure" icon="📅" value={form.days_left} onChange={set('days_left')} min={1} max={60} unit="days" />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.98 } : {}}
          onClick={() => !busy && onPredict(payload())}
          disabled={busy}
          className="btn-amber"
          style={{ flex: '1 1 160px', fontSize: 15, opacity: loading.predict ? 0.75 : 1 }}
        >
          <AnimatePresence mode="wait">
            {loading.predict && <Spinner key="spin" />}
          </AnimatePresence>
          {loading.predict ? 'Estimating…' : 'Estimate typical fare'}
        </motion.button>

        <motion.button
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.98 } : {}}
          onClick={() => !busy && onExplain(payload())}
          disabled={busy}
          className="btn-ghost"
          style={{ flex: '1 1 160px', fontSize: 15, opacity: loading.explain ? 0.75 : 1 }}
        >
          <AnimatePresence mode="wait">
            {loading.explain && <Spinner key="spin" />}
          </AnimatePresence>
          {loading.explain ? 'Analyzing…' : 'Explain the price'}
        </motion.button>
      </div>
    </motion.div>
  )
}
