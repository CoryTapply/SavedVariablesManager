/** `24.8 MB` - one decimal place, matching the design's file-size pills. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

/** Account folders are named like `1234567890#5` - the `#N` suffix is what a player actually
 * recognizes ("account 5"), matching how src/main/ipc/files.ts names backups. */
export function accountSuffix(accountName: string): string {
  const afterHash = accountName.split('#').pop() || accountName
  return afterHash
}
