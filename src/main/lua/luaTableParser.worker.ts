import { parentPort, workerData } from 'node:worker_threads'
import { readFileSync } from 'node:fs'
import { parseLuaAssignment } from './luaTableParser'

interface WorkerInput {
  filePath: string
}

interface WorkerSuccess {
  ok: true
  varName: string
  value: unknown
}

interface WorkerFailure {
  ok: false
  message: string
}

export type WorkerResult = WorkerSuccess | WorkerFailure

function run(): void {
  const { filePath } = workerData as WorkerInput
  try {
    const source = readFileSync(filePath, 'utf-8')
    const { varName, value } = parseLuaAssignment(source)
    const result: WorkerSuccess = { ok: true, varName, value }
    parentPort?.postMessage(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const result: WorkerFailure = { ok: false, message }
    parentPort?.postMessage(result)
  }
}

run()
