import { isLuaTable, type LuaValue } from '@shared/luaTypes'
import type { AuraDiffEntry, DeepComparisonResult } from '@shared/diffTypes'
import { diffLuaValues } from '../diff/diffEngine'
import type { AddonAnalyzer } from './addonAnalyzer'

interface AuraEntry {
  key: string
  uid?: string
  id?: string
  parent?: string
  controlledChildren?: string[]
  data: LuaValue
}

function extractDisplays(root: LuaValue): Map<string, AuraEntry> {
  const map = new Map<string, AuraEntry>()
  if (!isLuaTable(root)) return map
  const displays = root['displays']
  if (!isLuaTable(displays)) return map

  for (const [key, data] of Object.entries(displays)) {
    const entry: AuraEntry = { key, data }
    if (isLuaTable(data)) {
      if (typeof data['uid'] === 'string') entry.uid = data['uid']
      if (typeof data['id'] === 'string') entry.id = data['id']
      if (typeof data['parent'] === 'string') entry.parent = data['parent']
      const children = data['controlledChildren']
      if (Array.isArray(children)) {
        entry.controlledChildren = children.filter((c): c is string => typeof c === 'string')
      }
    }
    map.set(key, entry)
  }
  return map
}

function rootKeysExcludingDisplays(root: LuaValue): Set<string> {
  if (!isLuaTable(root)) return new Set()
  return new Set(Object.keys(root).filter((k) => k !== 'displays'))
}

export const weakAurasAnalyzer: AddonAnalyzer = {
  id: 'weakauras',
  displayName: 'WeakAuras',
  depth: 'deep',
  matchesFile(fileName) {
    return fileName === 'WeakAuras.lua'
  },
  matchesVarName(varName) {
    return varName === 'WeakAurasSaved'
  },
  compare(rootA, rootB): DeepComparisonResult {
    const displaysA = extractDisplays(rootA)
    const displaysB = extractDisplays(rootB)

    const remainingA = new Map(displaysA)
    const remainingB = new Map(displaysB)
    const entries: AuraDiffEntry[] = []

    // Pass 1: match by uid.
    const uidIndexB = new Map<string, string>() // uid -> key in B
    for (const [key, entry] of remainingB) {
      if (entry.uid) uidIndexB.set(entry.uid, key)
    }
    for (const [keyA, entryA] of Array.from(remainingA)) {
      if (!entryA.uid) continue
      const keyB = uidIndexB.get(entryA.uid)
      if (keyB === undefined) continue
      const entryB = remainingB.get(keyB)
      if (!entryB) continue
      entries.push(buildMatchedEntry(entryA, entryB, 'uid'))
      remainingA.delete(keyA)
      remainingB.delete(keyB)
      uidIndexB.delete(entryA.uid)
    }

    // Pass 2: fallback match by id (display name) among what's left.
    const idIndexB = new Map<string, string>() // id -> key in B
    for (const [key, entry] of remainingB) {
      if (entry.id) idIndexB.set(entry.id, key)
    }
    for (const [keyA, entryA] of Array.from(remainingA)) {
      if (!entryA.id) continue
      const keyB = idIndexB.get(entryA.id)
      if (keyB === undefined) continue
      const entryB = remainingB.get(keyB)
      if (!entryB) continue
      entries.push(buildMatchedEntry(entryA, entryB, 'id'))
      remainingA.delete(keyA)
      remainingB.delete(keyB)
      idIndexB.delete(entryA.id)
    }

    // Whatever's left is a pure add or remove.
    for (const entry of remainingA.values()) {
      entries.push({
        status: 'removed',
        key: entry.id ?? entry.key,
        parent: entry.parent,
        controlledChildren: entry.controlledChildren,
        fieldDiffs: []
      })
    }
    for (const entry of remainingB.values()) {
      entries.push({
        status: 'added',
        key: entry.id ?? entry.key,
        parent: entry.parent,
        controlledChildren: entry.controlledChildren,
        fieldDiffs: []
      })
    }

    const summary = {
      added: entries.filter((e) => e.status === 'added').length,
      removed: entries.filter((e) => e.status === 'removed').length,
      changed: entries.filter((e) => e.status === 'changed').length,
      unchanged: entries.filter((e) => e.status === 'unchanged').length
    }

    const rootKeysA = rootKeysExcludingDisplays(rootA)
    const rootKeysB = rootKeysExcludingDisplays(rootB)

    return {
      depth: 'deep',
      addonId: 'weakauras',
      displayName: 'WeakAuras',
      summary,
      entries,
      otherRootKeys: {
        onlyInA: [...rootKeysA].filter((k) => !rootKeysB.has(k)).sort(),
        onlyInB: [...rootKeysB].filter((k) => !rootKeysA.has(k)).sort()
      }
    }
  }
}

function buildMatchedEntry(a: AuraEntry, b: AuraEntry, matchedBy: 'uid' | 'id'): AuraDiffEntry {
  const fieldDiffs = diffLuaValues(a.data, b.data)
  return {
    status: fieldDiffs.length === 0 ? 'unchanged' : 'changed',
    matchedBy,
    key: b.id ?? a.id ?? b.key,
    parent: b.parent ?? a.parent,
    controlledChildren: b.controlledChildren ?? a.controlledChildren,
    fieldDiffs
  }
}
