import type { LuaValue } from './luaTypes'

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'
export type FieldDiffKind = 'added' | 'removed' | 'changed'

export interface FieldDiff {
  path: string[]
  oldValue?: LuaValue
  newValue?: LuaValue
  kind: FieldDiffKind
}

/** One entry in `displays` for a WeakAuras-style ('deep') addon analyzer. */
export interface AuraRecord {
  key: string
  uid?: string
  id?: string
  parent?: string
  controlledChildren?: string[]
  data: LuaValue
}

export interface AuraDiffEntry {
  status: DiffStatus
  matchedBy?: 'uid' | 'id'
  /** Display name - the aura's `id` when known, otherwise its raw `displays`-table key. Not
   * guaranteed unique (two auras can share a user-given `id`) - use `entryId` for identity. */
  key: string
  /** Stable, collision-free identity for this entry within one comparison result - the raw
   * `displays`-table key from whichever side matched (always unique per file), or the `uid`
   * when both sides shared one. Suitable for a UI's "selected item" state; `key` is not. */
  entryId: string
  parent?: string
  controlledChildren?: string[]
  fieldDiffs: FieldDiff[]
}

export type AddonAnalyzerDepth = 'deep' | 'basic'

export interface AddonComparisonSummary {
  added: number
  removed: number
  changed: number
  unchanged: number
}

/** Result for a 'basic' (generic, whole-file) addon comparison. */
export interface BasicComparisonResult {
  depth: 'basic'
  addonId: string
  displayName: string
  summary: AddonComparisonSummary
  fieldDiffs: FieldDiff[]
}

/** Result for a 'deep' (semantically-matched, e.g. WeakAuras) addon comparison. */
export interface DeepComparisonResult {
  depth: 'deep'
  addonId: string
  displayName: string
  summary: AddonComparisonSummary
  entries: AuraDiffEntry[]
  otherRootKeys: { onlyInA: string[]; onlyInB: string[] }
}

export type AddonComparisonResult = BasicComparisonResult | DeepComparisonResult

export interface FileMeta {
  path: string
  mtimeMs: number
}

export interface ComparisonResult {
  fileA: FileMeta
  fileB: FileMeta
  result: AddonComparisonResult
}
