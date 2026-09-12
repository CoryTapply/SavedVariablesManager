import React from 'react'

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  glyph?: React.ReactNode
  title: React.ReactNode
  body?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ glyph, title, body, action, style, ...rest }: EmptyStateProps) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        padding: 'var(--zp-space-8) var(--zp-space-6)',
        borderRadius: 'var(--zp-radius)',
        border: '1px dashed var(--zp-line-strong)',
        background: 'var(--zp-surface-1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--zp-space-3)',
        textAlign: 'center',
        ...style
      }}
      {...rest}
    >
      {glyph ? (
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--zp-radius)',
            border: '1px solid var(--zp-line-accent)',
            background: 'var(--zp-accent-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: '500 15px var(--zp-font-data)',
            color: 'var(--zp-accent-200)'
          }}
        >
          {glyph}
        </span>
      ) : null}
      <span style={{ font: 'var(--zp-text-h3)', color: 'var(--zp-text)' }}>{title}</span>
      {body ? (
        <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)', maxWidth: '40ch', textWrap: 'pretty' }}>{body}</span>
      ) : null}
      {action || null}
    </div>
  )
}
