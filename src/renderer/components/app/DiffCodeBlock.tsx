import React, { useMemo } from 'react'
import { diffLines } from '../../lib/lineDiff'
import { highlightLine } from '../../lib/codeHighlight'

interface DiffCodeBlockProps {
  oldText: string
  newText: string
}

/**
 * Split code-diff view for a single changed field's old/new value: two aligned columns,
 * line-diffed against each other so only the lines that actually changed are tinted
 * (removed = danger, added = success) instead of two opaque unrelated-looking blobs, with
 * the same token syntax coloring as the design system's CodeBlock layered underneath.
 */
export function DiffCodeBlock({ oldText, newText }: DiffCodeBlockProps) {
  const ops = useMemo(() => diffLines(oldText, newText), [oldText, newText])
  const added = ops.filter((o) => o.type === 'add').length
  const removed = ops.filter((o) => o.type === 'remove').length

  return (
    <div
      style={{
        boxSizing: 'border-box',
        borderRadius: 'var(--zp-radius)',
        border: '1px solid var(--zp-line)',
        background: 'var(--zp-surface-field)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--zp-space-3)',
          padding: '7px var(--zp-space-3)',
          borderBottom: '1px solid var(--zp-line)',
          background: 'var(--zp-surface-1)'
        }}
      >
        <span
          style={{
            font: 'var(--zp-text-micro)',
            letterSpacing: 'var(--zp-tracking-micro)',
            textTransform: 'uppercase',
            color: 'var(--zp-text-4)'
          }}
        >
          Before to After
        </span>
        <span style={{ font: 'var(--zp-text-micro)', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: 'var(--zp-success)' }}>+{added}</span>{' '}
          <span style={{ color: 'var(--zp-danger)' }}>-{removed}</span>
        </span>
      </div>
      <div className="zp-code" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ borderRight: '1px solid var(--zp-line)', overflowX: 'auto' }}>
          {ops.map((op, i) => {
            const html = op.type === 'add' ? '' : highlightLine(op.oldLine)
            return (
              <div
                key={i}
                style={{
                  padding: '0 var(--zp-space-3)',
                  minHeight: '1.6em',
                  font: 'var(--zp-text-data)',
                  whiteSpace: 'pre',
                  background: op.type === 'remove' ? 'var(--zp-danger-tint)' : undefined,
                  color: 'var(--zp-text-2)'
                }}
                dangerouslySetInnerHTML={{ __html: html || ' ' }}
              />
            )
          })}
        </div>
        <div style={{ overflowX: 'auto' }}>
          {ops.map((op, i) => {
            const html = op.type === 'remove' ? '' : highlightLine(op.newLine)
            return (
              <div
                key={i}
                style={{
                  padding: '0 var(--zp-space-3)',
                  minHeight: '1.6em',
                  font: 'var(--zp-text-data)',
                  whiteSpace: 'pre',
                  background: op.type === 'add' ? 'var(--zp-success-tint)' : undefined,
                  color: 'var(--zp-text-2)'
                }}
                dangerouslySetInnerHTML={{ __html: html || ' ' }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
