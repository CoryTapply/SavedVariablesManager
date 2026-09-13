import { ipcMain, dialog, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { getWowRoot, setWowRoot, getFlavorPreference, setFlavorPreference } from './store'
import { discoverAccounts, listAccountCharacters } from '../wow/accountDiscovery'
import type { AccountServerCharacters, DiscoveredAccounts } from '@shared/addonTypes'

function windowFor(event: IpcMainInvokeEvent): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(event.sender) ?? undefined
}

export function registerAccountHandlers(): void {
  ipcMain.handle('wow:getRoot', async () => getWowRoot())

  ipcMain.handle('wow:chooseRoot', async (event) => {
    const result = await dialog.showOpenDialog(windowFor(event) as BrowserWindow, {
      title: 'Select your World of Warcraft folder',
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const chosen = result.filePaths[0] ?? null
    if (chosen) setWowRoot(chosen)
    return chosen
  })

  ipcMain.handle('wow:discover', async (): Promise<DiscoveredAccounts | null> => {
    const root = getWowRoot()
    if (!root) return null
    return discoverAccounts(root)
  })

  ipcMain.handle(
    'wow:listAccountCharacters',
    async (_event, req: { accountDir: string }): Promise<AccountServerCharacters[]> =>
      listAccountCharacters(req.accountDir)
  )

  ipcMain.handle('wow:getFlavorPreference', async () => getFlavorPreference())

  ipcMain.handle('wow:setFlavorPreference', async (_event, flavor: string | null) => {
    setFlavorPreference(flavor)
  })
}
