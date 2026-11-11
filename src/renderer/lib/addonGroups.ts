/** A pseudo-addon in the addon picker that bundles several SavedVariables files so they can be
 * copied A -> B in one press. Copy-only: there's no single file to compare, so Compare stays
 * disabled while a group is selected. Matched against discovered files' `addonId` (the
 * lowercased filename without `.lua`, see accountDiscovery.ts). */
export interface AddonGroup {
  id: string
  label: string
  matches: (addonId: string) => boolean
}

/** Group ids are prefixed so they can never collide with a real file-derived `addonId`. */
const GROUP_ID_PREFIX = 'group:'

export const ADDON_GROUPS: AddonGroup[] = [
  {
    id: `${GROUP_ID_PREFIX}ellesmereui`,
    label: 'EllesmereUI (all but CDM)',
    // Cooldown Manager layouts are per-spec and usually differ between accounts on purpose.
    matches: (addonId) => addonId.startsWith('ellesmereui') && !addonId.includes('cooldownmanager')
  }
]

export function findAddonGroup(addonId: string): AddonGroup | undefined {
  if (!addonId.startsWith(GROUP_ID_PREFIX)) return undefined
  return ADDON_GROUPS.find((g) => g.id === addonId)
}
