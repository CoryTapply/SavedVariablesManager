import React from 'react'
import { Field } from '../forms/Field'
import { SegmentedControl } from '../forms/SegmentedControl'
import type { AddonOptions } from '../../lib/addonPriority'

interface AddonPickerProps {
  options: AddonOptions
  value: string
  onChange: (addonId: string) => void
}

const MORE = '__more__'

/** Addon is chosen once here and shared by both sides of the comparison - picking "WeakAuras"
 * picks it for account A and account B alike, since comparing different addons across the two
 * accounts is never a real use case. Priority addons sit in one continuous track (reusing the
 * same sliding-thumb control as the account/browse toggle); everything else lives behind a
 * trailing "More" segment so the row doesn't grow unbounded as more addons are discovered. */
export function AddonPicker({ options, value, onChange }: AddonPickerProps) {
  const { cards, rest } = options
  const restMatch = rest.find((a) => a.addonId === value)
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (cards.length === 0 && rest.length === 0) return null

  const trackOptions = [
    ...cards.map((c) => ({ value: c.addonId, label: c.label })),
    ...(rest.length > 0 ? [{ value: MORE, label: restMatch ? restMatch.displayName : 'More…' }] : [])
  ]

  return (
    <Field label="Addon">
      <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
        <SegmentedControl
          options={trackOptions}
          value={restMatch ? MORE : value}
          onChange={(v) => {
            if (v === MORE) {
              setOpen((o) => !o)
              return
            }
            setOpen(false)
            onChange(v)
          }}
        />
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
              transformOrigin: 'top right',
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
            {rest.map((a) => (
              <button
                key={a.addonId}
                onClick={() => {
                  onChange(a.addonId)
                  setOpen(false)
                }}
                style={{
                  textAlign: 'left',
                  padding: '7px 10px',
                  borderRadius: 'var(--zp-radius)',
                  border: '1px solid transparent',
                  background: a.addonId === value ? 'var(--zp-accent-tint)' : 'transparent',
                  color: a.addonId === value ? 'var(--zp-accent-200)' : 'var(--zp-text-2)',
                  font: 'var(--zp-text-sm)',
                  cursor: 'pointer'
                }}
              >
                {a.displayName}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Field>
  )
}
