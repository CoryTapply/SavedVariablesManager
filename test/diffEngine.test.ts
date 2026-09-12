import { describe, expect, it } from 'vitest'
import { diffLuaValues, summarizeFieldDiffs } from '../src/main/diff/diffEngine'
import type { LuaValue } from '../src/shared/luaTypes'

describe('diffLuaValues', () => {
  it('returns no diffs for identical values', () => {
    const a: LuaValue = { x: 1, y: 'a', z: [1, 2, 3] }
    expect(diffLuaValues(a, a)).toEqual([])
  })

  it('detects a changed scalar field', () => {
    const a: LuaValue = { x: 1 }
    const b: LuaValue = { x: 2 }
    expect(diffLuaValues(a, b)).toEqual([{ path: ['x'], oldValue: 1, newValue: 2, kind: 'changed' }])
  })

  it('detects an added and a removed key', () => {
    const a: LuaValue = { x: 1 }
    const b: LuaValue = { y: 2 }
    const diffs = diffLuaValues(a, b)
    expect(diffs).toContainEqual({ path: ['x'], oldValue: 1, newValue: undefined, kind: 'removed' })
    expect(diffs).toContainEqual({ path: ['y'], oldValue: undefined, newValue: 2, kind: 'added' })
  })

  it('recurses into nested tables and reports a dotted path', () => {
    const a: LuaValue = { trigger: { spellId: 123 } }
    const b: LuaValue = { trigger: { spellId: 456 } }
    expect(diffLuaValues(a, b)).toEqual([{ path: ['trigger', 'spellId'], oldValue: 123, newValue: 456, kind: 'changed' }])
  })

  it('index-aligns array (positional) values', () => {
    const a: LuaValue = { color: [1, 1, 1, 1] }
    const b: LuaValue = { color: [1, 0, 1, 1] }
    expect(diffLuaValues(a, b)).toEqual([{ path: ['color', '1'], oldValue: 1, newValue: 0, kind: 'changed' }])
  })

  it('treats a type mismatch (table vs scalar) as one changed leaf, not a crash', () => {
    const a: LuaValue = { x: { nested: 1 } }
    const b: LuaValue = { x: 'now a string' }
    expect(diffLuaValues(a, b)).toEqual([{ path: ['x'], oldValue: { nested: 1 }, newValue: 'now a string', kind: 'changed' }])
  })

  it('treats nil (null) correctly, distinct from a missing key', () => {
    const a: LuaValue = { x: null }
    const b: LuaValue = { x: null }
    expect(diffLuaValues(a, b)).toEqual([])
  })
})

describe('summarizeFieldDiffs', () => {
  it('counts each kind', () => {
    const diffs = [
      { path: ['a'], kind: 'added' as const },
      { path: ['b'], kind: 'removed' as const },
      { path: ['c'], kind: 'changed' as const },
      { path: ['d'], kind: 'changed' as const }
    ]
    expect(summarizeFieldDiffs(diffs)).toEqual({ added: 1, removed: 1, changed: 2 })
  })
})
