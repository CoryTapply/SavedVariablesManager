import type { FieldDiff } from '@shared/diffTypes'
import type { LuaValue } from '@shared/luaTypes'

export interface FieldDiffPresentation {
  /** 'code' fields render as a two-column diff grid, 'value' fields render as inline
   * `before → after` text - see designUpdates/design_handoff_compare_screen/README.md §2.2. */
  kind: 'value' | 'code'
  pathLabel: string
  beforeText: string
  afterText: string
}

function formatLuaValue(value: LuaValue | undefined): string {
  if (value === undefined) return '(none)'
  if (value === null) return 'nil'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

export function fieldPathLabel(path: string[]): string {
  return path.join(' › ')
}

/** Pure presentation shaping for one field diff: text values plus whether it reads as an
 * inline scalar or a multi-line code block, mirroring the design's per-field layout rules. */
export function presentFieldDiff(diff: FieldDiff): FieldDiffPresentation {
  const beforeText = formatLuaValue(diff.oldValue)
  const afterText = formatLuaValue(diff.newValue)
  const multiline = beforeText.includes('\n') || afterText.includes('\n') || beforeText.length > 60 || afterText.length > 60
  return {
    kind: multiline ? 'code' : 'value',
    pathLabel: fieldPathLabel(diff.path),
    beforeText,
    afterText
  }
}
