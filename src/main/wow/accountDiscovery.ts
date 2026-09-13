import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { AccountServerCharacters, DiscoveredAccounts, DiscoveredAddonFile, WowFlavor } from '@shared/addonTypes'
import { resolveAnalyzer } from '../addons/addonRegistry'

/** Known Battle.net flavor-folder names -> friendly label. Not exhaustive by design - any
 * folder containing `WTF` is treated as a valid flavor root (see findFlavorRoots), this map
 * only makes the common ones read nicely instead of showing the raw folder name. */
const KNOWN_FLAVOR_LABELS: Record<string, string> = {
  _retail_: 'Retail',
  _classic_: 'Classic',
  _classic_era_: 'Classic Era',
  _classic_ptr_: 'Classic PTR',
  _classic_era_ptr_: 'Classic Era PTR',
  _ptr_: 'PTR',
  _xptr_: 'PTR (2)',
  _beta_: 'Beta'
}

function labelForFlavor(folderName: string): string {
  const known = KNOWN_FLAVOR_LABELS[folderName]
  if (known) return known
  const cleaned = folderName.replace(/^_+|_+$/g, '').replace(/_/g, ' ').trim()
  if (!cleaned) return 'WoW'
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/**
 * The user points this app at their WoW installation once (no scanning of other folders or
 * drives - see the plan). `wowRoot` can be either the top-level install folder (containing
 * one subfolder per product, e.g. `_retail_`/`_classic_era_`) or one product's folder
 * directly (containing `WTF` itself); this detects which. Every direct subfolder that
 * contains `WTF` is treated as a flavor root - not a fixed allowlist - since Blizzard adds
 * and renames these over time (e.g. Anniversary realms did not match the previously
 * hardcoded `retail`/`classic`/`classic_era` set).
 */
function findFlavorRoots(wowRoot: string): Array<{ flavor: WowFlavor; label: string; path: string }> {
  if (existsSync(join(wowRoot, 'WTF'))) {
    return [{ flavor: '', label: labelForFlavor(''), path: wowRoot }]
  }

  const roots: Array<{ flavor: WowFlavor; label: string; path: string }> = []
  let entries: string[]
  try {
    entries = readdirSync(wowRoot)
  } catch {
    return roots
  }
  for (const entryName of entries) {
    const candidate = join(wowRoot, entryName)
    if (!isDirectory(candidate)) continue
    if (!existsSync(join(candidate, 'WTF'))) continue
    roots.push({ flavor: entryName, label: labelForFlavor(entryName), path: candidate })
  }
  return roots
}

export function discoverAccounts(wowRoot: string): DiscoveredAccounts {
  const flavorRoots = findFlavorRoots(wowRoot)
  const accounts: DiscoveredAccounts['accounts'] = []

  for (const { flavor, label, path: flavorPath } of flavorRoots) {
    const accountsDir = join(flavorPath, 'WTF', 'Account')
    if (!existsSync(accountsDir)) continue

    for (const accountName of readdirSync(accountsDir)) {
      const accountDir = join(accountsDir, accountName)
      if (!isDirectory(accountDir)) continue

      const savedVarsDir = join(accountDir, 'SavedVariables')

      const files: DiscoveredAddonFile[] = []
      if (existsSync(savedVarsDir)) {
        for (const fileName of readdirSync(savedVarsDir)) {
          if (!fileName.toLowerCase().endsWith('.lua')) continue
          const filePath = join(savedVarsDir, fileName)
          let stat
          try {
            stat = statSync(filePath)
          } catch {
            continue
          }
          if (!stat.isFile()) continue

          const analyzer = resolveAnalyzer(filePath)
          files.push({
            accountName,
            flavor,
            addonId: analyzer.id,
            displayName: analyzer.displayName,
            depth: analyzer.depth,
            filePath,
            fileMtimeMs: stat.mtimeMs,
            fileSizeBytes: stat.size
          })
        }
      }

      // Listed even with zero files - a freshly-created account is still a valid copy
      // destination (see SelectFilesScreen's copy-to-account-B flow), just not a valid
      // comparison side.
      accounts.push({ accountName, flavor, flavorLabel: label, accountDir, savedVariablesDir: savedVarsDir, files })
    }
  }

  return { wowRoot, accounts }
}

/**
 * Servers (realm folders) and characters found directly under an account folder
 * (`WTF/Account/<accountName>/<Realm>/<Character>`), for the settings dialog's expandable
 * account rows. Same "no fixed allowlist, just real directories" approach as
 * `findFlavorRoots`/`discoverAccounts`: every subfolder other than `SavedVariables` (the
 * account-wide addon data, not a realm) is treated as a server.
 */
export function listAccountCharacters(accountDir: string): AccountServerCharacters[] {
  if (!isDirectory(accountDir)) return []

  let entries: string[]
  try {
    entries = readdirSync(accountDir)
  } catch {
    return []
  }

  const servers: AccountServerCharacters[] = []
  for (const serverName of entries) {
    if (serverName === 'SavedVariables') continue
    const serverDir = join(accountDir, serverName)
    if (!isDirectory(serverDir)) continue

    let characterEntries: string[]
    try {
      characterEntries = readdirSync(serverDir)
    } catch {
      continue
    }
    const characters = characterEntries
      .filter((name) => isDirectory(join(serverDir, name)))
      .sort((a, b) => a.localeCompare(b))

    servers.push({ server: serverName, characters })
  }

  return servers.sort((a, b) => a.server.localeCompare(b.server))
}
