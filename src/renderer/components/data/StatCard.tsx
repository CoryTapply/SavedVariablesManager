import React from 'react'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode
  value?: React.ReactNode
  delta?: React.ReactNode
  deltaTone?: 'up' | 'down' | 'neutral'
  loading?: boolean
}

export function StatCard({ label, value, delta, deltaTone = 'neutral', loading = false, style, ...rest }: StatCardProps) {
  const tones = { up: 'var(--zp-success)', down: 'var(--zp-warning)', neutral: 'var(--zp-text-4)' }
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--zp-space-4)',
        borderRadius: 'var(--zp-radius)',
        border: '1px solid var(--zp-line)',
        background: 'var(--zp-surface-1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--zp-space-2)',
        ...style
      }}
      {...rest}
    >
      {loading ? (
        <div className="zp-sk" style={{ height: 8, width: '64%' }} />
      ) : (
        <span
          style={{
            font: 'var(--zp-text-micro)',
            letterSpacing: 'var(--zp-tracking-micro)',
            textTransform: 'uppercase',
            color: 'var(--zp-text-4)'
          }}
        >
          {label}
        </span>
      )}
      {loading ? (
        <div className="zp-sk" style={{ height: 26, width: '52%' }} />
      ) : (
        <span style={{ font: 'var(--zp-text-h2)', fontVariantNumeric: 'tabular-nums', color: 'var(--zp-text)' }}>
          {value}
        </span>
      )}
      {!loading && delta ? (
        <span style={{ font: 'var(--zp-text-sm)', color: tones[deltaTone] || tones.neutral }}>{delta}</span>
      ) : null}
    </div>
  )
}
