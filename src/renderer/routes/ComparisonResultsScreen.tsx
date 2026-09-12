import React, { useMemo, useState } from 'react'
import type { AuraDiffEntry, ComparisonResult, DiffStatus, FieldDiff } from '@shared/diffTypes'
import type { LuaValue } from '@shared/luaTypes'
import { PageShell } from '../components/surfaces/PageShell'
import { SectionHeading } from '../components/surfaces/SectionHeading'
import { Panel } from '../components/surfaces/Panel'
import { StatCard } from '../components/data/StatCard'
import { SegmentedControl } from '../components/forms/SegmentedControl'
import { Badge } from '../components/data/Badge'
import { Button } from '../components/buttons/Button'
import { EmptyState } from '../components/feedback/EmptyState'
import { CodeBlock } from '../components/marketing/CodeBlock'
import { DiffCodeBlock } from '../components/app/DiffCodeBlock'

type Filter = 'all' | 'added' | 'removed' | 'changed'

const STATUS_TONE: Record<DiffStatus, 'success' | 'danger' | 'warning' | 'neutral'> = {
  added: 'success',
  removed: 'danger',
  changed: 'warning',
  unchanged: 'neutral'
}

const KIND_TONE: Record<FieldDiff['kind'], 'success' | 'danger' | 'warning'> = {
  added: 'success',
  removed: 'danger',
  changed: 'warning'
}

function formatLuaValue(value: LuaValue | undefined): string {
  if (value === undefined) return '(none)'
  if (value === null) return 'nil'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

function fieldPathLabel(path: string[]): string {
  return path.join(' › ')
}

function FieldDiffRow({ diff }: { diff: FieldDiff }) {
  const oldText = formatLuaValue(diff.oldValue)
  const newText = formatLuaValue(diff.newValue)
  const multiline = oldText.includes('\n') || newText.includes('\n') || oldText.length > 60 || newText.length > 60

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-2)' }}>
        <Badge tone={KIND_TONE[diff.kind]}>{diff.kind}</Badge>
        <span style={{ font: 'var(--zp-text-data)', color: 'var(--zp-text-2)' }}>{fieldPathLabel(diff.path)}</span>
      </div>
      {multiline ? (
        diff.kind === 'changed' ? (
          <DiffCodeBlock oldText={oldText} newText={newText} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--zp-space-3)' }}>
            {diff.kind !== 'added' ? <CodeBlock filename="Before" code={oldText} /> : <div />}
            {diff.kind !== 'removed' ? <CodeBlock filename="After" code={newText} /> : <div />}
          </div>
        )
      ) : (
        <div style={{ display: 'flex', gap: 'var(--zp-space-3)', font: 'var(--zp-text-data)' }}>
          {diff.kind !== 'added' ? <span style={{ color: 'var(--zp-danger)' }}>{oldText}</span> : null}
          {diff.kind === 'changed' ? <span style={{ color: 'var(--zp-text-4)' }}>→</span> : null}
          {diff.kind !== 'removed' ? <span style={{ color: 'var(--zp-success)' }}>{newText}</span> : null}
        </div>
      )}
    </div>
  )
}

function AuraDiffRow({ entry }: { entry: AuraDiffEntry }) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = entry.fieldDiffs.length > 0

  return (
    <Panel elevation="flat" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--zp-space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-2)' }}>
          <Badge tone={STATUS_TONE[entry.status]}>{entry.status}</Badge>
          <span style={{ font: 'var(--zp-text-label)', color: 'var(--zp-text)' }}>{entry.key}</span>
          {entry.parent ? (
            <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>in {entry.parent}</span>
          ) : null}
        </div>
        {canExpand ? (
          <Button intent="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Hide details' : `${entry.fieldDiffs.length} field${entry.fieldDiffs.length === 1 ? '' : 's'} changed`}
          </Button>
        ) : null}
      </div>
      {expanded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)' }}>
          {entry.fieldDiffs.map((d, i) => (
            <FieldDiffRow key={i} diff={d} />
          ))}
        </div>
      ) : null}
    </Panel>
  )
}

export function ComparisonResultsScreen({ result, onBack }: { result: ComparisonResult; onBack: () => void }) {
  const [filter, setFilter] = useState<Filter>('all')
  const { result: comparison, fileA, fileB } = result

  const filteredEntries = useMemo(() => {
    if (comparison.depth !== 'deep') return []
    if (filter === 'all') return comparison.entries.filter((e) => e.status !== 'unchanged')
    return comparison.entries.filter((e) => e.status === filter)
  }, [comparison, filter])

  return (
    <PageShell maxWidth={1200}>
      <SectionHeading
        eyebrow={comparison.displayName}
        title="Comparison results"
        description={`${fileA.path} vs ${fileB.path}`}
        action={
          <Button intent="ghost" onClick={onBack}>
            ← Back
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--zp-space-4)' }}>
        <StatCard label="Added" value={comparison.summary.added} />
        <StatCard label="Removed" value={comparison.summary.removed} />
        <StatCard label="Changed" value={comparison.summary.changed} />
        {comparison.depth === 'deep' ? <StatCard label="Unchanged" value={comparison.summary.unchanged} /> : null}
      </div>

      {comparison.depth === 'deep' ? (
        <>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'added', label: 'Added' },
              { value: 'removed', label: 'Removed' },
              { value: 'changed', label: 'Changed' }
            ]}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
          />

          {filteredEntries.length === 0 ? (
            <EmptyState title="No differences found" body="Nothing matches this filter." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-3)' }}>
              {filteredEntries.map((entry, i) => (
                <AuraDiffRow key={i} entry={entry} />
              ))}
            </div>
          )}

          {comparison.otherRootKeys.onlyInA.length > 0 || comparison.otherRootKeys.onlyInB.length > 0 ? (
            <Panel elevation="flat" style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)' }}>
              Other saved data outside of auras also differs (not shown above):{' '}
              {comparison.otherRootKeys.onlyInA.length > 0 ? `only in A: ${comparison.otherRootKeys.onlyInA.join(', ')}. ` : null}
              {comparison.otherRootKeys.onlyInB.length > 0 ? `only in B: ${comparison.otherRootKeys.onlyInB.join(', ')}.` : null}
            </Panel>
          ) : null}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-3)' }}>
          {comparison.fieldDiffs.length === 0 ? (
            <EmptyState title="No differences found" body="These files are identical." />
          ) : (
            comparison.fieldDiffs.map((d, i) => (
              <Panel key={i} elevation="flat">
                <FieldDiffRow diff={d} />
              </Panel>
            ))
          )}
        </div>
      )}
    </PageShell>
  )
}
