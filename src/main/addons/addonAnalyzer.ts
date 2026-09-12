import type { LuaValue } from '@shared/luaTypes'
import type { AddonAnalyzerDepth, AddonComparisonResult } from '@shared/diffTypes'

export interface AddonAnalyzer {
  id: string
  displayName: string
  depth: AddonAnalyzerDepth
  /** Whether this analyzer handles a given SavedVariables file, by its base filename. Used
   *  for cheap discovery (before parsing) against real WTF/Account file names. */
  matchesFile(fileName: string): boolean
  /** Whether this analyzer handles a file by its parsed Lua global var name (e.g.
   *  `WeakAurasSaved`). Used once a file is parsed, so manually-renamed copies (the user's
   *  own sample files aren't named `WeakAuras.lua`) still resolve to the right analyzer. */
  matchesVarName?(varName: string): boolean
  compare(rootA: LuaValue, rootB: LuaValue): AddonComparisonResult
}
