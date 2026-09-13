import React from 'react'
import type { CompareListItem } from '../../lib/compareListItems'
import { Badge } from '../data/Badge'

const KIND_TONE = { added: 'success', removed: 'danger', changed: 'warning' } as const

function Row({ item, selected, onClick }: { item: CompareListItem; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--zp-space-3)',
        padding: '10px var(--zp-space-4)',
        borderBottom: '1px solid var(--zp-line)',
        borderLeft: `2px solid ${selected ? 'var(--zp-accent)' : 'transparent'}`,
        background: selected ? 'var(--zp-accent-tint)' : undefined,
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = 'var(--zp-surface-2)'
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = ''
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span
          style={{
            font: 'var(--zp-text-md)',
            color: selected ? 'var(--zp-text)' : 'var(--zp-text-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {item.name}
        </span>
        {item.group ? (
          <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>in {item.group}</span>
        ) : null}
      </div>
      <Badge tone={KIND_TONE[item.kind]} dot={false}>
        {item.kind === 'changed' ? item.fieldCount : item.kind}
      </Badge>
    </div>
  )
}

interface AuraListProps {
  items: CompareListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
  stacked?: boolean
}

/** Left pane of the master-detail split (README §2.2). Lists are hundreds of rows, not tens of
 * thousands, so this renders every matching row directly rather than windowing. No kind
 * selector here - the stat pills in the context strip above are the kind filter. */
export function AuraList({ items, selectedId, onSelect, query, onQueryChange, stacked = false }: AuraListProps) {
  return (
    <div
      style={{
        width: stacked ? '100%' : 360,
        maxHeight: stacked ? '45%' : undefined,
        flex: stacked ? '0 0 auto' : 'none',
        borderRight: stacked ? undefined : '1px solid var(--zp-line)',
        borderBottom: stacked ? '1px solid var(--zp-line)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--zp-space-2)',
          padding: 'var(--zp-space-3) var(--zp-space-4)',
          borderBottom: '1px solid var(--zp-line)',
          flex: '0 0 auto'
        }}
      >
        <input
          className="zp-in"
          style={{ flex: 1, height: 'var(--zp-control-h-sm)', padding: '0 10px' }}
          placeholder="⌕ Filter…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '10px var(--zp-space-4)', font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
            No auras match this filter.
          </div>
        ) : (
          items.map((item) => (
            <Row key={item.id} item={item} selected={item.id === selectedId} onClick={() => onSelect(item.id)} />
          ))
        )}
        {items.length > 0 ? (
          <div style={{ padding: '10px var(--zp-space-4)', font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
            … {items.length} total
          </div>
        ) : null}
      </div>
    </div>
  )
}
