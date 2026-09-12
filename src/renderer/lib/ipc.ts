import type { IpcContract } from '@shared/ipcContract'

export function invoke<K extends keyof IpcContract>(
  channel: K,
  request: IpcContract[K]['request']
): Promise<IpcContract[K]['response']> {
  return window.api.invoke(channel, request)
}
