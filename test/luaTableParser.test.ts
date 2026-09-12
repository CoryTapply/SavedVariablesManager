import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseLuaAssignment } from '../src/main/lua/luaTableParser'
import { isLuaTable } from '../src/shared/luaTypes'

describe('parseLuaAssignment - synthetic fixtures', () => {
  it('parses scalars, booleans, and nil', () => {
    const { varName, value } = parseLuaAssignment('Foo = {\n["a"] = 1,\n["b"] = true,\n["c"] = false,\n["d"] = nil,\n}')
    expect(varName).toBe('Foo')
    expect(value).toEqual({ a: 1, b: true, c: false, d: null })
  })

  it('parses double-quoted strings with escaped quotes and newlines', () => {
    const { value } = parseLuaAssignment('Foo = {\n["s"] = "he said \\"hi\\"\\nline2",\n}')
    expect(isLuaTable(value) && value['s']).toBe('he said "hi"\nline2')
  })

  it('parses single-quoted strings with escaped apostrophes', () => {
    const { value } = parseLuaAssignment("Foo = {\n['s'] = 'it\\'s a plain string',\n}")
    expect(isLuaTable(value) && value['s']).toBe("it's a plain string")
  })

  it('parses negative numbers and scientific notation', () => {
    const { value } = parseLuaAssignment('Foo = {\n["a"] = -10,\n["b"] = 1780864522,\n["c"] = 17868.515,\n["d"] = 7e6,\n}')
    expect(value).toEqual({ a: -10, b: 1780864522, c: 17868.515, d: 7e6 })
  })

  it('parses positional (array-style) tables', () => {
    const { value } = parseLuaAssignment('Foo = {\n["color"] = {\n1,\n1,\n0.5,\n1,\n},\n}')
    expect(isLuaTable(value) && value['color']).toEqual([1, 1, 0.5, 1])
  })

  it('parses nested tables with mixed keyed and positional siblings', () => {
    const { value } = parseLuaAssignment(
      'Foo = {\n["displays"] = {\n["Aura One"] = {\n["uid"] = "abc123",\n["color"] = {\n1,\n0,\n0,\n1,\n},\n},\n},\n}'
    )
    expect(isLuaTable(value)).toBe(true)
    const displays = isLuaTable(value) ? value['displays'] : undefined
    expect(isLuaTable(displays)).toBe(true)
    const aura = isLuaTable(displays) ? displays['Aura One'] : undefined
    expect(isLuaTable(aura) && aura['uid']).toBe('abc123')
    expect(isLuaTable(aura) && aura['color']).toEqual([1, 0, 0, 1])
  })

  it('treats -- as a line comment and --[[ ]] as a block comment outside strings', () => {
    const { value } = parseLuaAssignment('Foo = {\n-- a comment\n["a"] = 1, --[[ inline block ]] ["b"] = 2,\n}')
    expect(value).toEqual({ a: 1, b: 2 })
  })

  it('throws a LuaParseError with position info on malformed input', () => {
    expect(() => parseLuaAssignment('Foo = { ["a"] = }')).toThrow(/line \d+, offset \d+/)
  })
})

describe('parseLuaAssignment - real WeakAuras sample files', () => {
  const fileA = resolve(__dirname, '../WeakAuras_wow5.lua')
  const fileB = resolve(__dirname, '../WeakAuras_wow6.lua')
  const haveFixtures = existsSync(fileA) && existsSync(fileB)

  it.skipIf(!haveFixtures)('parses WeakAuras_wow5.lua into a well-formed displays table', () => {
    const source = readFileSync(fileA, 'utf-8')
    const { varName, value } = parseLuaAssignment(source)
    expect(varName).toBe('WeakAurasSaved')
    expect(isLuaTable(value)).toBe(true)
    const displays = isLuaTable(value) ? value['displays'] : undefined
    expect(isLuaTable(displays)).toBe(true)
    const auraCount = isLuaTable(displays) ? Object.keys(displays).length : 0
    expect(auraCount).toBeGreaterThan(3000)
  }, 60_000)

  it.skipIf(!haveFixtures)('parses WeakAuras_wow6.lua into a well-formed displays table', () => {
    const source = readFileSync(fileB, 'utf-8')
    const { varName, value } = parseLuaAssignment(source)
    expect(varName).toBe('WeakAurasSaved')
    const displays = isLuaTable(value) ? value['displays'] : undefined
    const auraCount = isLuaTable(displays) ? Object.keys(displays).length : 0
    expect(auraCount).toBeGreaterThan(3000)
  }, 60_000)
})
