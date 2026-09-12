import React from 'react'

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  starfield?: boolean
  maxWidth?: number | string
}

export function PageShell({ starfield = true, maxWidth = 1040, children, style, ...rest }: PageShellProps) {
  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        minHeight: '100vh',
        padding: 'var(--zp-space-9) var(--zp-space-8) var(--zp-space-10)',
        color: 'var(--zp-text)',
        fontFamily: 'var(--zp-font-body)',
        background: 'var(--zp-ground)',
        overflow: 'hidden',
        ...style
      }}
      {...rest}
    >
      {starfield ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 'var(--zp-starfield-opacity)',
            backgroundImage: 'var(--zp-starfield)'
          }}
        />
      ) : null}
      <div style={{ position: 'relative', maxWidth, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-10)' }}>
        {children}
      </div>
    </div>
  )
}
