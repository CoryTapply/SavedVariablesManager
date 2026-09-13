import type { AddonAnalyzerDepth } from '@shared/diffTypes'

export interface FileSelection {
  filePath: string
  label: string
  depth?: AddonAnalyzerDepth
  fileSizeBytes?: number
}
