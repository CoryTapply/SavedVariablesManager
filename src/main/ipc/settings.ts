import { app, ipcMain, dialog, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { AccountMetaMap, CompareSelectionPreference } from '@shared/addonTypes'
import {
  getBackupsDir,
  setBackupsDir,
  getAccountMeta,
  setAccountMeta,
  getSelectionPreference,
  setSelectionPreference
} from './store'

function windowFor(event: IpcMainInvokeEvent): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(event.sender) ?? undefined
}

export function registerSettingsHandlers(): void {
  ipcMain.handle('app:getVersion', async () => app.getVersion())

  ipcMain.handle('settings:getBackupsDir', async () => getBackupsDir())

  ipcMain.handle('settings:chooseBackupsDir', async (event) => {
    const result = await dialog.showOpenDialog(windowFor(event) as BrowserWindow, {
      title: 'Choose a folder for backups',
      defaultPath: getBackupsDir(),
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const chosen = result.filePaths[0] ?? null
    if (chosen) setBackupsDir(chosen)
    return chosen
  })

  ipcMain.handle('settings:getAccountMeta', async () => getAccountMeta())

  ipcMain.handle('settings:setAccountMeta', async (_event, next: AccountMetaMap) => {
    setAccountMeta(next)
  })

  ipcMain.handle('compare:getSelectionPreference', async () => getSelectionPreference())

  ipcMain.handle('compare:setSelectionPreference', async (_event, next: CompareSelectionPreference) => {
    setSelectionPreference(next)
  })
}
