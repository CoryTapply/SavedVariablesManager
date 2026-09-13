import React from 'react'
import type { WowFlavorOption } from '../../state/ComparisonContext'
import { useDropdown } from '../../lib/useDropdown'

interface FlavorSelectProps {
  options: WowFlavorOption[]
  value: string | null
  onChange: (flavor: string) => void
}

/** README §1.1's flavor pill - "Classic Era ▾", opens a small menu. Only rendered by the
 * caller when more than one flavor is discovered. */
export function FlavorSelect({ options, value, onChange }: FlavorSelectProps) {
  const { open, setOpen, ref } = useDropdown()
  const current = options.find((o) => o.flavor === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 'var(--zp-control-h-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 var(--zp-space-4)',
          borderRadius: 'var(--zp-radius-pill)',
          border: '1px solid var(--zp-line)',
          background: 'var(--zp-surface-2)',
          font: 'var(--zp-text-sm)',
          color: 'var(--zp-text-2)',
          cursor: 'pointer'
        }}
      >
        {current?.label ?? 'Choose flavor'} ▾
      </button>
      {open ? (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 180,
            maxHeight: 280,
            overflowY: 'auto',
            padding: 6,
            borderRadius: 'var(--zp-radius-md)',
            border: '1px solid var(--zp-line-strong)',
            background: 'var(--zp-surface-overlay)',
            backdropFilter: 'blur(var(--zp-blur-lg))',
            boxShadow: 'var(--zp-elev-overlay)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 5,
            animation: 'zp-slide-in var(--zp-dur) var(--zp-ease)'
          }}
        >
          {options.map((o) => (
            <button
              key={o.flavor}
              onClick={() => {
                onChange(o.flavor)
                setOpen(false)
              }}
              className={o.flavor === value ? 'zp-opt zp-opt-selected' : 'zp-opt'}
              style={{
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: 'var(--zp-radius)',
                border: '1px solid transparent',
                font: 'var(--zp-text-sm)',
                cursor: 'pointer'
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
