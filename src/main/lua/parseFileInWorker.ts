import { Worker } from 'node:worker_threads'
import { join } from 'node:path'
import type { LuaValue } from '@shared/luaTypes'

export interface ParsedLuaFile {
  varName: string
  value: LuaValue
}

/**
 * Runs `luaTableParser` inside a worker thread so parsing a large (tens-of-MB) SavedVariables
 * file never blocks the main process's event loop (IPC replies, menus, etc).
 *
 * electron-vite bundles everything reachable from the `index` entry into one `out/main/index.js`
 * chunk, so this file's own code ends up inlined there too - only rollup inputs declared
 * explicitly (electron.vite.config.ts) become separate output files. The worker was declared
 * as `lua/luaTableParser.worker`, so it always lands at `out/main/lua/luaTableParser.worker.js`
 * regardless of where the code calling this function was originally inlined from.
 */
export function parseFileInWorker(filePath: string): Promise<ParsedLuaFile> {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, 'lua/luaTableParser.worker.js')
    const worker = new Worker(workerPath, { workerData: { filePath } })

    worker.once('message', (msg) => {
      void worker.terminate()
      if (msg.ok) {
        resolve({ varName: msg.varName, value: msg.value as LuaValue })
      } else {
        reject(new Error(`Failed to parse ${filePath}: ${msg.message}`))
      }
    })
    worker.once('error', (err) => {
      void worker.terminate()
      reject(err)
    })
  })
}
