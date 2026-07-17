import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, ResponsiveContainer, LabelList,
} from 'recharts'

const RED = '#ff6b5e'
const GREEN = '#4ade80'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  const isPositive = value >= 0
  return (
    <div style={{
      background: 'var(--ink)', border: '1px solid var(--line-strong)',
      borderRadius: 10, padding: '10px 16px', fontSize: 13,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ margin: '0 0 4px', color: 'var(--dim)', fontWeight: 500 }}>{name}</p>
      <p style={{ margin: 0, fontWeight: 700, color: isPositive ? RED : GREEN }}>
        {isPositive ? '+' : ''}₹{value.toLocaleString('en-IN')}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--faint)' }}>
        {isPositive ? 'increases' : 'decreases'} price
      </p>
    </div>
  )
}

function BarLabel({ x, y, width, height, value }) {
  if (value === 0 || Math.abs(width) < 30) return null
  const isPositive = value >= 0
  const text = `${isPositive ? '+' : ''}₹${Math.abs(value).toLocaleString('en-IN')}`
  return (
    <text
      x={isPositive ? x + width - 7 : x + 7}
      y={y + height / 2}
      textAnchor={isPositive ? 'end' : 'start'}
      dominantBaseline="middle"
      fill="rgba(255,255,255,0.88)"
      fontSize={10}
      fontWeight={700}
      fontFamily="Inter, sans-serif"
    >
      {text}
    </text>
  )
}

export default function SHAPChart({ featureImportance }) {
  const data = Object.entries(featureImportance)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass"
      style={{ marginBottom: 20, padding: '32px 24px 24px' }}
    >
      <h3 style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.01em' }}>
        Why does this flight cost this much?
      </h3>
      <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: RED, display: 'inline-block' }} />
          Price driver (increases cost)
        </span>
        <span style={{ fontSize: 12, color: 'var(--dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: GREEN, display: 'inline-block' }} />
          Price reducer (lowers cost)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(260, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
          <XAxis
            type="number"
            tickFormatter={v => {
              if (v === 0) return '₹0'
              const k = Math.abs(v) / 1000
              return `${v < 0 ? '-' : '+'}₹${k.toFixed(1)}k`
            }}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={112}
            tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)" />
          <Bar dataKey="value" radius={[0, 5, 5, 0]} maxBarSize={32}>
            <LabelList content={<BarLabel />} />
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? RED : GREEN} fillOpacity={0.82} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
