import React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null
  label?: React.ReactNode
  caption?: React.ReactNode
}

export function Progress({ value, label, caption, style, ...rest }: ProgressProps) {
  const indeterminate = value == null
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-2)', maxWidth: 460, ...style }} {...rest}>
      {label || caption ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--zp-space-3)' }}>
          {label ? (
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
          ) : null}
          {caption ? (
            <span style={{ font: 'var(--zp-text-micro)', fontVariantNumeric: 'tabular-nums', color: 'var(--zp-text-2)' }}>
              {caption}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : pct}
        style={{
          position: 'relative',
          height: 6,
          borderRadius: 'var(--zp-radius-pill)',
          background: 'var(--zp-surface-2)',
          border: '1px solid var(--zp-line)',
          overflow: 'hidden'
        }}
      >
        {indeterminate ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '38%',
              borderRadius: 'var(--zp-radius-pill)',
              background: 'linear-gradient(90deg,transparent,var(--zp-accent-400),transparent)',
              animation: 'zp-indet 1.4s var(--zp-ease) infinite'
            }}
          />
        ) : (
          <div
            style={{
              width: pct + '%',
              height: '100%',
              background: 'linear-gradient(90deg,var(--zp-accent-600),var(--zp-accent-300))',
              boxShadow: 'var(--zp-accent-glow)'
            }}
          />
        )}
      </div>
    </div>
  )
}
