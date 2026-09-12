import { contextBridge, ipcRenderer } from 'electron'
import type { IpcContract } from '@shared/ipcContract'

const api = {
  invoke<K extends keyof IpcContract>(
    channel: K,
    request: IpcContract[K]['request']
  ): Promise<IpcContract[K]['response']> {
    return ipcRenderer.invoke(channel, request)
  }
}

export type PreloadApi = typeof api

contextBridge.exposeInMainWorld('api', api)
