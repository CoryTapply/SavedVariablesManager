import type { ComparisonResult } from './diffTypes'
import type { AccountMetaMap, AccountServerCharacters, CompareSelectionPreference, DiscoveredAccounts } from './addonTypes'

export interface CopyFileRequest {
  source: string
  destination: string
  overwrite: boolean
}

export type CopyFileResponse =
  | { ok: true }
  | { ok: false; reason: 'exists' }
  | { ok: false; reason: 'error'; message: string }

export interface CompareRequest {
  fileA: string
  fileB: string
}

export interface CopyAddonFileRequest {
  /** Account A's file for the shared addon - copied as-is. */
  source: string
  /** Account B's file for the shared addon - overwritten. */
  destination: string
  /** Used to name the backup of `destination`'s prior contents, e.g. `weakauras`. */
  addonId: string
  /** Account B's account folder name, e.g. `1234567890#5` - the backup is named from its `#N` suffix. */
  destinationAccountName: string
}

export type CopyAddonFileResponse =
  | { ok: true; backupPath: string | null }
  | { ok: false; reason: 'error'; message: string }

export interface IpcContract {
  'wow:getRoot': { request: void; response: string | null }
  'wow:chooseRoot': { request: void; response: string | null }
  'wow:discover': { request: void; response: DiscoveredAccounts | null }
  'wow:listAccountCharacters': { request: { accountDir: string }; response: AccountServerCharacters[] }
  'wow:getFlavorPreference': { request: void; response: string | null }
  'wow:setFlavorPreference': { request: string | null; response: void }
  'file:pickSaveDestination': { request: { defaultPath?: string }; response: string | null }
  'file:exists': { request: { path: string }; response: boolean }
  'file:copy': { request: CopyFileRequest; response: CopyFileResponse }
  'file:copyAddonFile': { request: CopyAddonFileRequest; response: CopyAddonFileResponse }
  'file:showInFolder': { request: { path: string }; response: void }
  'compare:run': { request: CompareRequest; response: ComparisonResult }
  'settings:getBackupsDir': { request: void; response: string }
  'settings:chooseBackupsDir': { request: void; response: string | null }
  'settings:getAccountMeta': { request: void; response: AccountMetaMap }
  'settings:setAccountMeta': { request: AccountMetaMap; response: void }
  'compare:getSelectionPreference': { request: void; response: CompareSelectionPreference | null }
  'compare:setSelectionPreference': { request: CompareSelectionPreference; response: void }
}

export type IpcChannel = keyof IpcContract
