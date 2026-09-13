import React from 'react'
import type { AddonComparisonSummary } from '@shared/diffTypes'
import { Button } from '../buttons/Button'
import { Badge } from '../data/Badge'
import type { AccountLabel, CompareFilter } from '../../state/ComparisonContext'
import { formatBytes } from '../../lib/format'
import type { FileSelection } from '../../state/fileSelection'

interface StatPillDef {
  kind: Exclude<CompareFilter, 'all'>
  color: string
  label: string
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--zp-space-2)',
        height: 26,
        padding: '0 var(--zp-space-3)',
        borderRadius: 'var(--zp-radius-pill)',
        border: '1px solid var(--zp-line-strong)',
        background: 'var(--zp-surface-2)',
        font: 'var(--zp-text-label)',
        color: 'var(--zp-text-2)'
      }}
    >
      {children}
    </span>
  )
}

function StatPill({ def, active, count, onClick }: { def: StatPillDef; active: boolean; count: number; onClick: () => void }) {
  return (
    <button
      role="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--zp-space-2)',
        height: 'var(--zp-control-h-sm)',
        padding: '0 var(--zp-space-4)',
        borderRadius: 'var(--zp-radius-pill)',
        border: `1px solid ${active ? 'var(--zp-line-accent)' : 'var(--zp-line-strong)'}`,
        background: active ? 'var(--zp-accent-tint)' : 'transparent',
        color: active ? 'var(--zp-accent-200)' : 'var(--zp-text-2)',
        font: 'var(--zp-text-sm)',
        cursor: 'pointer'
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 999, background: def.color, boxShadow: `0 0 8px ${def.color}` }} />
      {count} {def.label}
    </button>
  )
}

interface ContextStripProps {
  flavorLabel?: string
  addonLabel: string
  accountNameA: string
  accountNameB: string
  fileA: FileSelection | null
  fileB: FileSelection | null
  labelForAccount: (accountName: string) => AccountLabel
  onChangeSelection: () => void
  depth: 'deep' | 'basic'
  summary: AddonComparisonSummary
  filter: CompareFilter
  onToggleFilter: (kind: Exclude<CompareFilter, 'all'>) => void
  onClearFilter: () => void
}

const STAT_DEFS: StatPillDef[] = [
  { kind: 'added', color: '#5ec48a', label: 'added' },
  { kind: 'removed', color: '#e8636b', label: 'removed' },
  { kind: 'changed', color: '#e8a44c', label: 'changed' }
]

/** README §2.1 - replaces the command bar in place once compared. */
export function ContextStrip({
  flavorLabel,
  addonLabel,
  accountNameA,
  accountNameB,
  fileA,
  fileB,
  labelForAccount,
  onChangeSelection,
  depth,
  summary,
  filter,
  onToggleFilter,
  onClearFilter
}: ContextStripProps) {
  const labelA = labelForAccount(accountNameA)
  const labelB = labelForAccount(accountNameB)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)' }}>
      <div className="zp-collapse-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-4)', flexWrap: 'wrap' }}>
        {flavorLabel ? <Pill>{flavorLabel}</Pill> : null}
        <Pill>◆ {addonLabel}</Pill>
        <Pill>
          <Badge tone="success" style={{ padding: '0 5px', height: 16 }}>A</Badge>
          <span style={{ font: 'var(--zp-text-data)' }}>{labelA.label}</span>
          {fileA?.fileSizeBytes != null ? (
            <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>{formatBytes(fileA.fileSizeBytes)}</span>
          ) : null}
        </Pill>
        <span style={{ color: 'var(--zp-text-4)' }} aria-hidden="true">⇄</span>
        <Pill>
          <Badge tone="warning" style={{ padding: '0 5px', height: 16 }}>B</Badge>
          <span style={{ font: 'var(--zp-text-data)' }}>{labelB.label}</span>
          {fileB?.fileSizeBytes != null ? (
            <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>{formatBytes(fileB.fileSizeBytes)}</span>
          ) : null}
        </Pill>
        <div style={{ flex: 1 }} />
        <Button intent="ghost" size="sm" onClick={onChangeSelection}>
          Change selection
        </Button>
      </div>

      <hr className="zp-collapse-in" style={{ border: 'none', height: 1, background: 'var(--zp-rule-fade)', margin: 0 }} />

      <div className="zp-collapse-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-4)', flexWrap: 'wrap' }}>
        {STAT_DEFS.map((def) => (
          <StatPill key={def.kind} def={def} active={filter === def.kind} count={summary[def.kind]} onClick={() => onToggleFilter(def.kind)} />
        ))}
        {depth === 'deep' ? (
          <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>{summary.unchanged} unchanged, hidden</span>
        ) : null}
        {filter !== 'all' ? (
          <Button intent="ghost" size="sm" onClick={onClearFilter}>
            Clear filter
          </Button>
        ) : null}
      </div>
    </div>
  )
}
