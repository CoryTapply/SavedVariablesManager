import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { weakAurasAnalyzer } from '../src/main/addons/weakAuras'
import { createGenericBasicAnalyzer } from '../src/main/addons/genericBasic'
import { parseLuaAssignment } from '../src/main/lua/luaTableParser'
import type { LuaValue } from '../src/shared/luaTypes'

function displays(entries: Record<string, LuaValue>): LuaValue {
  return { displays: entries }
}

describe('weakAurasAnalyzer', () => {
  it('matches an aura by uid even when renamed', () => {
    const a = displays({ 'Old Name': { uid: 'u1', id: 'Old Name', duration: 5 } })
    const b = displays({ 'New Name': { uid: 'u1', id: 'New Name', duration: 5 } })
    const result = weakAurasAnalyzer.compare(a, b)
    expect(result.summary).toEqual({ added: 0, removed: 0, changed: 1, unchanged: 0 })
    expect(result.entries[0]?.matchedBy).toBe('uid')
    expect(result.entries[0]?.key).toBe('New Name')
    expect(result.entries[0]?.entryId).toBe('u1')
  })

  it('falls back to matching by id when uid is missing or differs', () => {
    const a = displays({ Foo: { id: 'Foo', duration: 5 } })
    const b = displays({ Foo: { id: 'Foo', duration: 8 } })
    const result = weakAurasAnalyzer.compare(a, b)
    expect(result.entries[0]?.matchedBy).toBe('id')
    expect(result.entries[0]?.status).toBe('changed')
    expect(result.entries[0]?.fieldDiffs).toEqual([{ path: ['duration'], oldValue: 5, newValue: 8, kind: 'changed' }])
    expect(result.entries[0]?.entryId).toBe('Foo')
  })

  it('reports unmatched entries as added or removed', () => {
    const a = displays({ Gone: { uid: 'u1', id: 'Gone' } })
    const b = displays({ New: { uid: 'u2', id: 'New' } })
    const result = weakAurasAnalyzer.compare(a, b)
    expect(result.summary).toEqual({ added: 1, removed: 1, changed: 0, unchanged: 0 })
    const ids = result.entries.map((e) => e.entryId).sort()
    expect(ids).toEqual(['u1', 'u2'])
  })

  it('reports unchanged auras with no field diffs', () => {
    const a = displays({ Same: { uid: 'u1', id: 'Same', duration: 5 } })
    const b = displays({ Same: { uid: 'u1', id: 'Same', duration: 5 } })
    const result = weakAurasAnalyzer.compare(a, b)
    expect(result.summary.unchanged).toBe(1)
  })

  it('reports root keys outside displays that only exist on one side', () => {
    const a = { displays: {}, dbVersion: 90 }
    const b = { displays: {}, lastUpgrade: 123 }
    const result = weakAurasAnalyzer.compare(a, b)
    expect(result.otherRootKeys).toEqual({ onlyInA: ['dbVersion'], onlyInB: ['lastUpgrade'] })
  })
})

describe('genericBasic analyzer', () => {
  it('diffs the whole root table with no matching phase', () => {
    const analyzer = createGenericBasicAnalyzer('details', 'Details')
    const a: LuaValue = { profiles: { p1: { x: 1 } } }
    const b: LuaValue = { profiles: { p1: { x: 2 } } }
    const result = analyzer.compare(a, b)
    expect(result.summary).toEqual({ added: 0, removed: 0, changed: 1, unchanged: 0 })
    expect(result.fieldDiffs).toEqual([{ path: ['profiles', 'p1', 'x'], oldValue: 1, newValue: 2, kind: 'changed' }])
  })
})

describe('end-to-end against real sample files', () => {
  const fileA = resolve(__dirname, '../WeakAuras_wow5.lua')
  const fileB = resolve(__dirname, '../WeakAuras_wow6.lua')
  const haveFixtures = existsSync(fileA) && existsSync(fileB)

  it.skipIf(!haveFixtures)(
    'produces internally-consistent summary counts for the two real sample files',
    () => {
      const parsedA = parseLuaAssignment(readFileSync(fileA, 'utf-8'))
      const parsedB = parseLuaAssignment(readFileSync(fileB, 'utf-8'))
      const result = weakAurasAnalyzer.compare(parsedA.value, parsedB.value)

      const total = result.summary.added + result.summary.removed + result.summary.changed + result.summary.unchanged
      expect(total).toBe(result.entries.length)
      expect(total).toBeGreaterThan(3000)
      expect(result.summary.added).toBeGreaterThanOrEqual(0)
      expect(result.summary.removed).toBeGreaterThanOrEqual(0)
    },
    60_000
  )
})
