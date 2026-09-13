import React from 'react'
import type { AddonOptions } from '../../lib/addonPriority'
import { useDropdown } from '../../lib/useDropdown'

interface AddonSelectProps {
  options: AddonOptions
  value: string
  onChange: (addonId: string) => void
}

/** The command bar's addon control: a plain "WeakAuras ▾" pill-select (README §1.2 #1), not
 * the priority-cards-plus-segmented-track look of the old AddonPicker it replaces. Addon is
 * chosen once and shared by both sides of the comparison. */
export function AddonSelect({ options, value, onChange }: AddonSelectProps) {
  const { open, setOpen, ref } = useDropdown()
  const all = [...options.cards.map((c) => ({ addonId: c.addonId, label: c.label })), ...options.rest.map((a) => ({ addonId: a.addonId, label: a.displayName }))]
  const current = all.find((a) => a.addonId === value)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={all.length === 0}
        style={{
          width: 190,
          height: 'var(--zp-control-h)',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--zp-space-2)',
          padding: '0 var(--zp-space-4)',
          borderRadius: 'var(--zp-radius)',
          border: '1px solid var(--zp-line)',
          background: 'var(--zp-surface-field)',
          color: 'var(--zp-text)',
          font: 'var(--zp-text-md)',
          cursor: all.length === 0 ? 'default' : 'pointer'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current ? current.label : 'No addons found'}
        </span>
        <span style={{ color: 'var(--zp-text-4)' }}>▾</span>
      </button>
      {open ? (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            minWidth: 200,
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
          {all.map((a) => (
            <button
              key={a.addonId}
              onClick={() => {
                onChange(a.addonId)
                setOpen(false)
              }}
              className={a.addonId === value ? 'zp-opt zp-opt-selected' : 'zp-opt'}
              style={{
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: 'var(--zp-radius)',
                border: '1px solid transparent',
                font: 'var(--zp-text-sm)',
                cursor: 'pointer'
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
