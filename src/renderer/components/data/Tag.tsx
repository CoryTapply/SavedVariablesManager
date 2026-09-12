import React from 'react'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean
  rail?: string
  onDismiss?: () => void
}

export function Tag({ selected = false, rail, onDismiss, children, style, ...rest }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: onDismiss ? '4px 6px 4px 10px' : rail ? '4px 10px 4px 7px' : '4px 10px',
        borderRadius: 'var(--zp-radius)',
        border: `1px solid ${selected ? 'var(--zp-line-accent)' : 'var(--zp-line-strong)'}`,
        background: selected ? 'var(--zp-accent-tint)' : 'var(--zp-surface-2)',
        font: 'var(--zp-text-label)',
        color: selected ? 'var(--zp-accent-200)' : 'var(--zp-text-2)',
        ...style
      }}
      {...rest}
    >
      {rail ? <span style={{ width: 3, height: 14, borderRadius: 1, background: rail, flex: '0 0 auto' }} /> : null}
      {children}
      {onDismiss ? (
        <span
          role="button"
          aria-label="Remove"
          onClick={onDismiss}
          style={{ font: 'var(--zp-text-micro)', color: 'var(--zp-text-4)', cursor: 'pointer' }}
        >
          ✕
        </span>
      ) : null}
    </span>
  )
}
