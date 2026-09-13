import { describe, expect, it } from 'vitest'
import { isNewerVersion } from '../src/main/versionCompare'

describe('isNewerVersion', () => {
  it('detects a newer patch version', () => {
    expect(isNewerVersion('0.1.0', '0.1.1')).toBe(true)
  })

  it('detects a newer minor version', () => {
    expect(isNewerVersion('0.1.9', '0.2.0')).toBe(true)
  })

  it('detects a newer major version', () => {
    expect(isNewerVersion('0.9.9', '1.0.0')).toBe(true)
  })

  it('returns false for the same version', () => {
    expect(isNewerVersion('1.2.3', '1.2.3')).toBe(false)
  })

  it('returns false for an older version', () => {
    expect(isNewerVersion('1.2.3', '1.2.2')).toBe(false)
  })

  it('handles a leading "v" on either version', () => {
    expect(isNewerVersion('0.1.0', 'v0.2.0')).toBe(true)
    expect(isNewerVersion('v0.1.0', '0.2.0')).toBe(true)
  })
})
