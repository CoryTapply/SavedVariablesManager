import { registerFileHandlers } from './files'
import { registerAccountHandlers } from './accounts'
import { registerCompareHandlers } from './compare'
import { registerSettingsHandlers } from './settings'

export function registerIpcHandlers(): void {
  registerFileHandlers()
  registerAccountHandlers()
  registerCompareHandlers()
  registerSettingsHandlers()
}
