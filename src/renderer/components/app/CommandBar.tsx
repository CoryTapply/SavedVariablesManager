import React from 'react'
import type { DiscoveredAccounts } from '@shared/addonTypes'
import { Panel } from '../surfaces/Panel'
import { Button } from '../buttons/Button'
import type { AddonOptions } from '../../lib/addonPriority'
import type { AccountLabel } from '../../state/ComparisonContext'
import type { FileSelection } from '../../state/fileSelection'
import { AddonSelect } from './AddonSelect'
import { AccountSelect } from './AccountSelect'

interface CommandBarProps {
  addonOptions: AddonOptions
  selectedAddonId: string
  onAddonChange: (addonId: string) => void
  accounts: DiscoveredAccounts['accounts']
  accountNameA: string
  accountNameB: string
  onAccountAChange: (accountName: string) => void
  onAccountBChange: (accountName: string) => void
  onSwap: () => void
  labelForAccount: (accountName: string) => AccountLabel
  fileA: FileSelection | null
  fileB: FileSelection | null
  addonLabel: string
  canCompare: boolean
  comparing: boolean
  onCompare: () => void
  canCopy: boolean
  copying: boolean
  onCopy: () => void
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        font: '500 10px var(--zp-font-ui)',
        letterSpacing: 'var(--zp-tracking-micro)',
        textTransform: 'uppercase',
        color: 'var(--zp-text-3)'
      }}
    >
      {children}
    </span>
  )
}

/** The idle-state command bar - README §1.2's core change: one horizontal row replacing the
 * old two-stacked-cards layout. Flavor lives above this (in the header row); everything else
 * needed to compare or copy lives here. */
export function CommandBar({
  addonOptions,
  selectedAddonId,
  onAddonChange,
  accounts,
  accountNameA,
  accountNameB,
  onAccountAChange,
  onAccountBChange,
  onSwap,
  labelForAccount,
  fileA,
  fileB,
  addonLabel,
  canCompare,
  comparing,
  onCompare,
  canCopy,
  copying,
  onCopy
}: CommandBarProps) {
  return (
    <Panel
      padding="var(--zp-space-4)"
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-4)', flexWrap: 'wrap' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <GroupLabel>Addon</GroupLabel>
        <AddonSelect options={addonOptions} value={selectedAddonId} onChange={onAddonChange} />
      </div>

      <span style={{ width: 1, height: 28, background: 'var(--zp-line)', flex: '0 0 auto' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <GroupLabel>Account A</GroupLabel>
        <AccountSelect
          accounts={accounts}
          value={accountNameA}
          onChange={onAccountAChange}
          labelForAccount={labelForAccount}
          noFileLabel={accountNameA && !fileA ? `no ${addonLabel} file yet` : undefined}
        />
      </div>

      <span style={{ fontSize: 18, color: 'var(--zp-text-4)', paddingTop: 14, flex: '0 0 auto' }} aria-hidden="true">
        <button
          onClick={onSwap}
          aria-label="Swap account A and account B"
          style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
        >
          ⇄
        </button>
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <GroupLabel>Account B</GroupLabel>
        <AccountSelect
          accounts={accounts}
          value={accountNameB}
          onChange={onAccountBChange}
          labelForAccount={labelForAccount}
          noFileLabel={accountNameB && !fileB ? `no ${addonLabel} file yet` : undefined}
        />
      </div>

      <div style={{ flex: 1 }} />

      <Button intent="primary" disabled={!canCompare} loading={comparing} onClick={onCompare}>
        Compare
      </Button>
      <Button intent="ghost" disabled={!canCopy} loading={copying} onClick={onCopy}>
        Copy A → B
      </Button>
    </Panel>
  )
}
