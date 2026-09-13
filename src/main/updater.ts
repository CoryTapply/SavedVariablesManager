import { app, dialog, shell } from 'electron'
import electronUpdater from 'electron-updater'
import { isNewerVersion } from './versionCompare'

const { autoUpdater } = electronUpdater

const REPO_OWNER = 'CoryTapply'
const REPO_NAME = 'SavedVariablesManager'

interface GithubRelease {
  tag_name: string
  html_url: string
}

function initWindowsUpdater(): void {
  autoUpdater.autoDownload = false

  autoUpdater.on('update-available', (info) => {
    void dialog
      .showMessageBox({
        type: 'info',
        message: `Version ${info.version} is available`,
        detail: 'Download it now?',
        buttons: ['Download', 'Later'],
        defaultId: 0,
        cancelId: 1
      })
      .then((result) => {
        if (result.response === 0) void autoUpdater.downloadUpdate()
      })
  })

  autoUpdater.on('update-downloaded', () => {
    void dialog
      .showMessageBox({
        type: 'info',
        message: 'Update downloaded',
        detail: 'Restart now to install it?',
        buttons: ['Restart', 'Later'],
        defaultId: 0,
        cancelId: 1
      })
      .then((result) => {
        if (result.response === 0) autoUpdater.quitAndInstall()
      })
  })

  autoUpdater.on('error', (error) => {
    console.error('[updater]', error)
  })

  void autoUpdater.checkForUpdates()
}

async function initFallbackUpdater(): Promise<void> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`
    )
    if (!response.ok) return

    const release = (await response.json()) as GithubRelease
    if (!isNewerVersion(app.getVersion(), release.tag_name)) return

    const result = await dialog.showMessageBox({
      type: 'info',
      message: `Version ${release.tag_name.replace(/^v/, '')} is available`,
      detail: 'View the release to download it?',
      buttons: ['View Release', 'Later'],
      defaultId: 0,
      cancelId: 1
    })

    if (result.response === 0) void shell.openExternal(release.html_url)
  } catch (error) {
    console.error('[updater]', error)
  }
}

export function initUpdater(): void {
  if (process.platform === 'win32') {
    initWindowsUpdater()
  } else {
    void initFallbackUpdater()
  }
}
