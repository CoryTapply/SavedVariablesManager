import type { AddonAnalyzerDepth } from './diffTypes'

/**
 * Raw Battle.net install-folder name for a WoW product (e.g. `_classic_era_`, `_retail_`),
 * or `''` for a `wowRoot` that points directly at one flavor's folder (contains `WTF`
 * itself, no flavor subfolders). Not a fixed enum: Blizzard adds/renames these over time
 * (e.g. Anniversary realms), so discovery reports whatever folder names actually exist on
 * disk rather than a hardcoded allowlist - see [[wow-addon-file-format]].
 */
export type WowFlavor = string

export interface DiscoveredAddonFile {
  accountName: string
  flavor: WowFlavor
  addonId: string
  displayName: string
  depth: AddonAnalyzerDepth
  filePath: string
  fileMtimeMs: number
  fileSizeBytes: number
}

export interface DiscoveredAccounts {
  wowRoot: string
  accounts: Array<{
    accountName: string
    flavor: WowFlavor
    flavorLabel: string
    /** The account's own folder (`WTF/Account/<accountName>`) - parent of
     * `savedVariablesDir`, and of the realm/character folders `listAccountCharacters` reads. */
    accountDir: string
    /** Where this account's addon files live (or would live, for an addon it hasn't saved
     * anything for yet) - lets the UI offer this account as a copy destination even when
     * `files` doesn't have an entry for the addon being compared. */
    savedVariablesDir: string
    files: DiscoveredAddonFile[]
  }>
}

/** One realm's characters under an account folder, as returned by `listAccountCharacters` -
 * see [[wow-addon-file-format]] for the on-disk `WTF/Account/<id>/<Realm>/<Character>` shape. */
export interface AccountServerCharacters {
  server: string
  characters: string[]
}

/** App-local label/favorite for an account, keyed by its raw folder name (`accountName`, e.g.
 * `1234567890#5`). Never renames anything on disk - see [[wow-addon-file-format]]. */
export interface AccountMeta {
  name: string
  favorite: boolean
}

export type AccountMetaMap = Record<string, AccountMeta>

/** Persisted addon/account picks for the compare screen (README: "selection, persisted"). */
export interface CompareSelectionPreference {
  addonId: string
  accountA: string
  accountB: string
}
