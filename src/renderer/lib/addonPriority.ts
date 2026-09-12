import type { DiscoveredAccounts } from '@shared/addonTypes'

export interface AddonOption {
  addonId: string
  displayName: string
}

export interface AddonCard {
  addonId: string
  label: string
}

/** Card order for the addon picker. Matched against a discovered file's `addonId` (the
 * lowercased SavedVariables filename, see accountDiscovery.ts) via `aliases`, since some
 * addons are better known by a shorthand (e.g. MSBT) than their actual filename. */
const PRIORITY_ADDONS: Array<{ label: string; aliases: string[] }> = [
  { label: 'WeakAuras', aliases: ['weakauras'] },
  { label: 'Plater', aliases: ['plater'] },
  { label: 'MSBT', aliases: ['msbt', 'mikscrollingbattletext'] },
  { label: 'ZerpyUI', aliases: ['zerpyui'] },
  { label: 'Dominos', aliases: ['dominos'] }
]

export interface AddonOptions {
  cards: AddonCard[]
  rest: AddonOption[]
}

/** Every addon discovered across all (visible) accounts, deduped by `addonId`, split into the
 * priority cards (in PRIORITY_ADDONS order, only when actually present) and everything else. */
export function computeAddonOptions(accounts: DiscoveredAccounts | null): AddonOptions {
  const byId = new Map<string, AddonOption>()
  for (const account of accounts?.accounts ?? []) {
    for (const file of account.files) {
      if (!byId.has(file.addonId)) byId.set(file.addonId, { addonId: file.addonId, displayName: file.displayName })
    }
  }

  const cards: AddonCard[] = []
  const cardIds = new Set<string>()
  for (const priority of PRIORITY_ADDONS) {
    const match = priority.aliases.map((alias) => byId.get(alias)).find((found): found is AddonOption => Boolean(found))
    if (match) {
      cards.push({ addonId: match.addonId, label: priority.label })
      cardIds.add(match.addonId)
    }
  }

  const rest = Array.from(byId.values())
    .filter((a) => !cardIds.has(a.addonId))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return { cards, rest }
}
