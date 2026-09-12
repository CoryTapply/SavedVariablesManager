import { app } from 'electron'
import { join } from 'node:path'
import Store from 'electron-store'

interface StoreSchema {
  wowRoot: string | null
  flavorPreference: string | null
  backupsDir: string | null
}

export const appStore = new Store<StoreSchema>({
  defaults: { wowRoot: null, flavorPreference: null, backupsDir: null }
})

export function getWowRoot(): string | null {
  return appStore.get('wowRoot')
}

export function setWowRoot(path: string | null): void {
  appStore.set('wowRoot', path)
}

export function getFlavorPreference(): string | null {
  return appStore.get('flavorPreference')
}

export function setFlavorPreference(flavor: string | null): void {
  appStore.set('flavorPreference', flavor)
}

/** Falls back to `userData/backups` until the user picks a location of their own. */
export function getDefaultBackupsDir(): string {
  return join(app.getPath('userData'), 'backups')
}

export function getBackupsDir(): string {
  return appStore.get('backupsDir') ?? getDefaultBackupsDir()
}

export function setBackupsDir(path: string | null): void {
  appStore.set('backupsDir', path)
}
