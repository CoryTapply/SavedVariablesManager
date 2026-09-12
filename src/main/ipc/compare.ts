import { statSync } from 'node:fs'
import { ipcMain } from 'electron'
import { parseFileInWorker } from '../lua/parseFileInWorker'
import { resolveAnalyzerForParsed } from '../addons/addonRegistry'
import type { CompareRequest } from '@shared/ipcContract'
import type { ComparisonResult } from '@shared/diffTypes'

export function registerCompareHandlers(): void {
  ipcMain.handle('compare:run', async (_event, req: CompareRequest): Promise<ComparisonResult> => {
    const [parsedA, parsedB] = await Promise.all([
      parseFileInWorker(req.fileA),
      parseFileInWorker(req.fileB)
    ])

    const analyzer = resolveAnalyzerForParsed(req.fileA, parsedA.varName)
    const result = analyzer.compare(parsedA.value, parsedB.value)

    const statA = statSync(req.fileA)
    const statB = statSync(req.fileB)

    return {
      fileA: { path: req.fileA, mtimeMs: statA.mtimeMs },
      fileB: { path: req.fileB, mtimeMs: statB.mtimeMs },
      result
    }
  })
}
