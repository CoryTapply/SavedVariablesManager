import React from 'react'

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  htmlFor?: string
}

export function Field({ label, hint, error, htmlFor, children, style, ...rest }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }} {...rest}>
      {label ? (
        <label
          htmlFor={htmlFor}
          style={{
            font: 'var(--zp-text-micro)',
            letterSpacing: 'var(--zp-tracking-micro)',
            textTransform: 'uppercase',
            color: error ? 'var(--zp-danger)' : 'var(--zp-text-4)'
          }}
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-danger)' }}>{error}</span>
      ) : hint ? (
        <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>{hint}</span>
      ) : null}
    </div>
  )
}
