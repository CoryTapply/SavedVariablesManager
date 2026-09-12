import React from 'react'

export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'accent' | 'danger'
}

export function CountBadge({ tone = 'accent', children, style, ...rest }: CountBadgeProps) {
  const danger = tone === 'danger'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 22,
        height: 22,
        padding: '0 6px',
        borderRadius: 'var(--zp-radius-pill)',
        background: danger ? 'var(--zp-danger-tint)' : 'var(--zp-accent-tint-strong)',
        border: `1px solid ${danger ? 'var(--zp-danger-line)' : 'var(--zp-line-accent)'}`,
        font: 'var(--zp-text-micro)',
        fontVariantNumeric: 'tabular-nums',
        color: danger ? 'var(--zp-danger-text)' : 'var(--zp-accent-100)',
        ...style
      }}
      {...rest}
    >
      {children}
    </span>
  )
}
