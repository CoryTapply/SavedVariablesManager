import React from 'react'
import type { CompareListItem } from '../../lib/compareListItems'
import { presentFieldDiff } from '../../lib/fieldDiffPresentation'
import { accountSuffix } from '../../lib/format'
import { Badge } from '../data/Badge'
import { Panel } from '../surfaces/Panel'
import { DiffCodeBlock } from './DiffCodeBlock'

const KIND_TONE = { added: 'success', removed: 'danger', changed: 'warning' } as const
const KIND_LABEL = { added: 'added', removed: 'removed', changed: 'changed' } as const

interface AuraDetailPaneProps {
  item: CompareListItem | null
  accountNameA: string
  accountNameB: string
  otherRootKeys: { onlyInA: string[]; onlyInB: string[] }
}

/** Right pane of the master-detail split (README §2.2). */
export function AuraDetailPane({ item, accountNameA, accountNameB, otherRootKeys }: AuraDetailPaneProps) {
  const hasFootnote = otherRootKeys.onlyInA.length > 0 || otherRootKeys.onlyInB.length > 0

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: 'var(--zp-space-5) var(--zp-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)' }}>
        {!item ? (
          <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>Select an aura to see its diff.</span>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--zp-space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--zp-space-3)' }}>
                <Badge tone={KIND_TONE[item.kind]}>{KIND_LABEL[item.kind]}</Badge>
                <span style={{ font: 'var(--zp-text-h3)', color: 'var(--zp-text)' }}>{item.name}</span>
                {item.group ? <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>in {item.group}</span> : null}
              </div>
              <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
                {item.kind === 'changed'
                  ? `${item.fieldCount} field${item.fieldCount === 1 ? '' : 's'} changed`
                  : item.kind === 'added'
                    ? `Only in account ${accountSuffix(accountNameB)}`
                    : `Only in account ${accountSuffix(accountNameA)}`}
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--zp-line)', margin: 0 }} />

            {item.kind === 'changed' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)' }}>
                {item.fields.map((field, i) => {
                  const presentation = presentFieldDiff(field)
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-2)' }}>
                        <Badge tone="warning">changed</Badge>
                        <span style={{ font: 'var(--zp-text-data)', color: 'var(--zp-text-3)' }}>{presentation.pathLabel}</span>
                      </div>
                      {presentation.kind === 'code' ? (
                        <DiffCodeBlock oldText={presentation.beforeText} newText={presentation.afterText} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--zp-space-3)', font: 'var(--zp-text-data)', paddingLeft: 4 }}>
                          <span style={{ color: 'var(--zp-danger)' }}>{presentation.beforeText}</span>
                          <span style={{ color: 'var(--zp-text-4)' }}>→</span>
                          <span style={{ color: 'var(--zp-success)' }}>{presentation.afterText}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <Panel elevation="flat" style={{ padding: 'var(--zp-space-4)', font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
                {item.kind === 'added'
                  ? `This aura exists only in account ${accountSuffix(accountNameB)}. Copy A → B will not remove it; run Copy B → A to bring it across.`
                  : `This aura exists only in account ${accountSuffix(accountNameA)}. Copy A → B will recreate it in account ${accountSuffix(accountNameB)}.`}
              </Panel>
            )}
          </>
        )}
      </div>

      {hasFootnote ? (
        <div style={{ padding: '0 var(--zp-space-6) var(--zp-space-5)' }}>
          <Panel elevation="flat" style={{ padding: 'var(--zp-space-3) var(--zp-space-4)', font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)' }}>
            Other saved data outside of auras also differs (not shown above):{' '}
            {otherRootKeys.onlyInA.length > 0 ? (
              <>
                only in A:{' '}
                {otherRootKeys.onlyInA.map((k, i) => (
                  <React.Fragment key={k}>
                    {i > 0 ? ', ' : ''}
                    <span style={{ font: 'var(--zp-text-data)' }}>{k}</span>
                  </React.Fragment>
                ))}
                .{' '}
              </>
            ) : null}
            {otherRootKeys.onlyInB.length > 0 ? (
              <>
                only in B:{' '}
                {otherRootKeys.onlyInB.map((k, i) => (
                  <React.Fragment key={k}>
                    {i > 0 ? ', ' : ''}
                    <span style={{ font: 'var(--zp-text-data)' }}>{k}</span>
                  </React.Fragment>
                ))}
                .
              </>
            ) : null}
          </Panel>
        </div>
      ) : null}
    </div>
  )
}
