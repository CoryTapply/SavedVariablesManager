import React from 'react'
import { IconButton } from '../buttons/IconButton'

export interface DialogProps {
  open?: boolean
  title: React.ReactNode
  description?: React.ReactNode
  onClose?: () => void
  footer?: React.ReactNode
  width?: number | string
  children?: React.ReactNode
}

export function Dialog({ open = true, title, description, onClose, footer, width = 420, children }: DialogProps) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(6,6,14,.62)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--zp-space-6)'
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: width,
          padding: 'var(--zp-space-6)',
          borderRadius: 'var(--zp-radius-md)',
          border: '1px solid var(--zp-line-strong)',
          background: 'var(--zp-surface-overlay)',
          backdropFilter: 'blur(var(--zp-blur-lg))',
          boxShadow: 'var(--zp-elev-overlay)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--zp-space-5)',
          animation: 'zp-slide-in var(--zp-dur) var(--zp-ease)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--zp-space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-2)' }}>
            <span style={{ font: 'var(--zp-text-h3)', color: 'var(--zp-text)' }}>{title}</span>
            {description ? (
              <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)', maxWidth: '48ch', textWrap: 'pretty' }}>
                {description}
              </span>
            ) : null}
          </div>
          {onClose ? (
            <IconButton label="Close" intent="ghost" size="sm" onClick={onClose}>
              ✕
            </IconButton>
          ) : null}
        </div>
        {children}
        {footer ? <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--zp-space-2)' }}>{footer}</div> : null}
      </div>
    </div>
  )
}
