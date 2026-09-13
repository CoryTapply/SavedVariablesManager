export function isNewerVersion(current: string, latest: string): boolean {
  const parse = (version: string): [number, number, number] => {
    const [major, minor, patch] = version
      .replace(/^v/, '')
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0)
    return [major ?? 0, minor ?? 0, patch ?? 0]
  }

  const [currentMajor, currentMinor, currentPatch] = parse(current)
  const [latestMajor, latestMinor, latestPatch] = parse(latest)

  if (latestMajor !== currentMajor) return latestMajor > currentMajor
  if (latestMinor !== currentMinor) return latestMinor > currentMinor
  return latestPatch > currentPatch
}
