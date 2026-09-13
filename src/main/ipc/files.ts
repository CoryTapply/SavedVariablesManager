import { existsSync, copyFileSync, mkdirSync, constants } from 'node:fs'
import { join, dirname } from 'node:path'
import { ipcMain, dialog, shell, BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { CopyFileRequest, CopyFileResponse, CopyAddonFileRequest, CopyAddonFileResponse } from '@shared/ipcContract'
import { getBackupsDir } from './store'

function windowFor(event: IpcMainInvokeEvent): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(event.sender) ?? undefined
}

/** Account folders under `WTF/Account` are named like `1234567890#5` for a numbered game
 * account - kept in full (not just the `#N` suffix) so backups from different accounts never
 * collide on the same short name. */
function accountBackupSuffix(accountName: string): string {
  return accountName.replace(/[^A-Za-z0-9_-]/g, '_') || 'account'
}

/** `2026-09-11_14-30-05` - readable, sorts correctly, and avoids `:` (invalid in Windows
 * filenames). Local time, since that's what the player backing up the file expects to see. */
function backupTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
}

export function registerFileHandlers(): void {
  ipcMain.handle('file:pickSaveDestination', async (event, req: { defaultPath?: string }) => {
    const result = await dialog.showSaveDialog(windowFor(event) as BrowserWindow, {
      title: 'Choose destination',
      defaultPath: req.defaultPath,
      filters: [{ name: 'Lua SavedVariables', extensions: ['lua'] }]
    })
    if (result.canceled || !result.filePath) return null
    return result.filePath
  })

  ipcMain.handle('file:exists', async (_event, req: { path: string }) => {
    return existsSync(req.path)
  })

  ipcMain.handle('file:copy', async (_event, req: CopyFileRequest): Promise<CopyFileResponse> => {
    try {
      const flag = req.overwrite ? 0 : constants.COPYFILE_EXCL
      copyFileSync(req.source, req.destination, flag)
      return { ok: true }
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException
      if (nodeErr.code === 'EEXIST') return { ok: false, reason: 'exists' }
      return { ok: false, reason: 'error', message: nodeErr.message ?? String(err) }
    }
  })

  ipcMain.handle('file:copyAddonFile', async (_event, req: CopyAddonFileRequest): Promise<CopyAddonFileResponse> => {
    try {
      let backupPath: string | null = null
      if (existsSync(req.destination)) {
        const backupsDir = getBackupsDir()
        mkdirSync(backupsDir, { recursive: true })
        backupPath = join(
          backupsDir,
          `${req.addonId}_${accountBackupSuffix(req.destinationAccountName)}_${backupTimestamp(new Date())}.lua`
        )
        copyFileSync(req.destination, backupPath)
      } else {
        mkdirSync(dirname(req.destination), { recursive: true })
      }
      copyFileSync(req.source, req.destination)
      return { ok: true, backupPath }
    } catch (err) {
      const nodeErr = err as NodeJS.ErrnoException
      return { ok: false, reason: 'error', message: nodeErr.message ?? String(err) }
    }
  })

  ipcMain.handle('file:showInFolder', async (_event, req: { path: string }) => {
    shell.showItemInFolder(req.path)
  })
}
