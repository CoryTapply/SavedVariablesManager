import type { LuaValue } from '@shared/luaTypes'
import type { BasicComparisonResult } from '@shared/diffTypes'
import { diffLuaValues, summarizeFieldDiffs } from '../diff/diffEngine'
import type { AddonAnalyzer } from './addonAnalyzer'

/**
 * Fallback analyzer for any addon's SavedVariables file that doesn't have a dedicated 'deep'
 * analyzer. Since the Lua-table parser already works on any Ace3/WeakAuras-style
 * SavedVariables file (the grammar isn't WeakAuras-specific), this runs the same generic
 * structural diff directly on the two whole root tables with no per-item identity matching -
 * it reports which top-level keys were added/removed/changed, not "which items changed."
 */
export function createGenericBasicAnalyzer(id: string, displayName: string): AddonAnalyzer {
  return {
    id,
    displayName,
    depth: 'basic',
    matchesFile: () => true,
    compare(rootA: LuaValue, rootB: LuaValue): BasicComparisonResult {
      const fieldDiffs = diffLuaValues(rootA, rootB)
      const { added, removed, changed } = summarizeFieldDiffs(fieldDiffs)
      return {
        depth: 'basic',
        addonId: id,
        displayName,
        summary: { added, removed, changed, unchanged: 0 },
        fieldDiffs
      }
    }
  }
}
