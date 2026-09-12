import React from 'react'

const TONES = {
  success: ['var(--zp-success)', 'var(--zp-success-tint)', 'var(--zp-success-line)'],
  warning: ['var(--zp-warning)', 'var(--zp-warning-tint)', 'var(--zp-warning-line)'],
  danger: ['var(--zp-danger)', 'var(--zp-danger-tint)', 'var(--zp-danger-line)'],
  info: ['var(--zp-info)', 'var(--zp-info-tint)', 'var(--zp-info-line)'],
  neutral: ['var(--zp-text-3)', 'var(--zp-surface-2)', 'var(--zp-line-strong)']
} as const

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  dot?: boolean
}

export function Badge({ tone = 'neutral', dot = true, children, style, ...rest }: BadgeProps) {
  const [color, bg, border] = TONES[tone] || TONES.neutral
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 9px',
        borderRadius: 'var(--zp-radius)',
        border: `1px solid ${border}`,
        background: bg,
        font: 'var(--zp-text-micro)',
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color,
        ...style
      }}
      {...rest}
    >
      {dot ? (
        <span
          style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}
        />
      ) : null}
      {children}
    </span>
  )
}
