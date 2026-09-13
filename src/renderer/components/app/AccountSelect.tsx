import React from 'react'
import type { DiscoveredAccounts } from '@shared/addonTypes'
import { useDropdown } from '../../lib/useDropdown'
import type { AccountLabel } from '../../state/ComparisonContext'

interface AccountSelectProps {
  accounts: DiscoveredAccounts['accounts']
  value: string
  onChange: (accountName: string) => void
  labelForAccount: (accountName: string) => AccountLabel
  width?: number
  /** README empty state: when the selected account has no file for the current addon, the
   * trigger reads this text (e.g. "no WeakAuras file yet") at reduced opacity instead of the
   * normal name/id label - there's no separate file-summary row anymore. */
  noFileLabel?: string
}

/** Account picker for the command bar: unlike a native `<select>`, renders each option as a
 * two-tone "name + muted id" row (README §1.2/§2.1) - needed once accounts can be named. */
export function AccountSelect({ accounts, value, onChange, labelForAccount, width = 220, noFileLabel }: AccountSelectProps) {
  const { open, setOpen, ref } = useDropdown()
  const current = value ? labelForAccount(value) : null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={accounts.length === 0}
        style={{
          width,
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
          cursor: accounts.length === 0 ? 'default' : 'pointer'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          {current && noFileLabel ? (
            <span style={{ color: 'var(--zp-text-4)', opacity: 0.55 }}>{noFileLabel}</span>
          ) : current ? (
            <>
              <span>{current.label}</span>
              {current.sub ? (
                <span style={{ font: 'var(--zp-text-micro)', color: 'var(--zp-text-4)' }}>{current.sub}</span>
              ) : null}
            </>
          ) : (
            <span style={{ color: 'var(--zp-text-4)' }}>Choose an account…</span>
          )}
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
            minWidth: '100%',
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
          {accounts.map((a) => {
            const label = labelForAccount(a.accountName)
            return (
              <button
                key={a.accountName}
                onClick={() => {
                  onChange(a.accountName)
                  setOpen(false)
                }}
                className={a.accountName === value ? 'zp-opt zp-opt-selected' : 'zp-opt'}
                style={{
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                  padding: '7px 10px',
                  borderRadius: 'var(--zp-radius)',
                  border: '1px solid transparent',
                  font: 'var(--zp-text-sm)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{label.label}</span>
                {label.sub ? <span style={{ font: 'var(--zp-text-micro)', color: 'var(--zp-text-4)' }}>{label.sub}</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
