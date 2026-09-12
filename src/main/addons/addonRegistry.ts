import { basename } from 'node:path'
import type { AddonAnalyzer } from './addonAnalyzer'
import { weakAurasAnalyzer } from './weakAuras'
import { createGenericBasicAnalyzer } from './genericBasic'

/**
 * Analyzers with a dedicated, semantically-aware ('deep') comparator. Adding support for a
 * new addon at 'deep' depth later just means writing one more file like `weakAuras.ts` and
 * registering it here - nothing else in the app needs to change.
 */
const DEEP_ANALYZERS: AddonAnalyzer[] = [weakAurasAnalyzer]

function displayNameFromFileName(fileName: string): string {
  return fileName.replace(/\.lua$/i, '')
}

/** Resolves the analyzer that should handle a given SavedVariables file, by its base filename. */
export function resolveAnalyzer(filePath: string): AddonAnalyzer {
  const fileName = basename(filePath)
  const deep = DEEP_ANALYZERS.find((a) => a.matchesFile(fileName))
  if (deep) return deep

  const addonId = fileName.replace(/\.lua$/i, '').toLowerCase()
  return createGenericBasicAnalyzer(addonId, displayNameFromFileName(fileName))
}

export function analyzerDepthFor(filePath: string): 'deep' | 'basic' {
  return resolveAnalyzer(filePath).depth
}

/**
 * Resolves the analyzer once a file has actually been parsed, preferring a match on the
 * parsed Lua global var name (robust to a renamed file, e.g. a manually-copied sample) and
 * falling back to the filename-based match.
 */
export function resolveAnalyzerForParsed(filePath: string, varName: string): AddonAnalyzer {
  const deep = DEEP_ANALYZERS.find((a) => a.matchesVarName?.(varName))
  if (deep) return deep
  return resolveAnalyzer(filePath)
}
