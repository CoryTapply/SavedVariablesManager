import { ipcMain, dialog, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { getBackupsDir, setBackupsDir } from './store'

function windowFor(event: IpcMainInvokeEvent): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(event.sender) ?? undefined
}

export function registerSettingsHandlers(): void {
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
}
