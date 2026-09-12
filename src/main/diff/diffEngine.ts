import { isLuaArray, isLuaTable, type LuaValue } from '@shared/luaTypes'
import type { FieldDiff } from '@shared/diffTypes'

/**
 * Generic, addon-agnostic recursive structural diff between two Lua value trees. This is the
 * one primitive every addon comparator builds on: 'deep' analyzers (e.g. WeakAuras) call it
 * per matched pair after an identity-matching phase; the 'basic' generic analyzer calls it
 * directly on the two whole root tables with no matching phase at all.
 */
export function diffLuaValues(a: LuaValue | undefined, b: LuaValue | undefined, path: string[] = []): FieldDiff[] {
  if (a === undefined && b === undefined) return []
  if (a === undefined) return [{ path, oldValue: undefined, newValue: b, kind: 'added' }]
  if (b === undefined) return [{ path, oldValue: a, newValue: undefined, kind: 'removed' }]

  if (isLuaTable(a) && isLuaTable(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    const diffs: FieldDiff[] = []
    for (const key of keys) {
      diffs.push(...diffLuaValues(a[key], b[key], [...path, key]))
    }
    return diffs
  }

  if (isLuaArray(a) && isLuaArray(b)) {
    const length = Math.max(a.length, b.length)
    const diffs: FieldDiff[] = []
    for (let i = 0; i < length; i++) {
      diffs.push(...diffLuaValues(a[i], b[i], [...path, String(i)]))
    }
    return diffs
  }

  // Type mismatch (e.g. a table replaced by a scalar) or differing scalars: report the
  // whole subtree as one changed leaf rather than recursing into incompatible shapes.
  if (!valuesEqual(a, b)) {
    return [{ path, oldValue: a, newValue: b, kind: 'changed' }]
  }
  return []
}

function valuesEqual(a: LuaValue, b: LuaValue): boolean {
  if (isLuaTable(a) || isLuaTable(b) || isLuaArray(a) || isLuaArray(b)) {
    // Reaching here means shapes differ (one is a container, the other isn't, or
    // table-vs-array) - never structurally equal.
    return false
  }
  return a === b
}

export function summarizeFieldDiffs(diffs: FieldDiff[]): { added: number; removed: number; changed: number } {
  let added = 0
  let removed = 0
  let changed = 0
  for (const d of diffs) {
    if (d.kind === 'added') added += 1
    else if (d.kind === 'removed') removed += 1
    else changed += 1
  }
  return { added, removed, changed }
}
