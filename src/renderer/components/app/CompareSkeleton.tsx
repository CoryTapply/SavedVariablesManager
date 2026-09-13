import React from 'react'
import { Skeleton } from '../data/Skeleton'

/** Shown while a compare is running: holds the exact boxes of the strip and the split so
 * nothing jumps once real content lands (README: "frames are real from the first paint, only
 * values shimmer"). */
export function CompareSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 'var(--zp-space-4)' }}>
        <Skeleton width={110} height={26} radius="var(--zp-radius-pill)" />
        <Skeleton width={130} height={26} radius="var(--zp-radius-pill)" />
        <Skeleton width={160} height={26} radius="var(--zp-radius-pill)" />
        <Skeleton width={160} height={26} radius="var(--zp-radius-pill)" />
      </div>
      <div style={{ height: 1, background: 'var(--zp-line)' }} />
      <div style={{ display: 'flex', gap: 'var(--zp-space-4)' }}>
        <Skeleton width={100} height={30} radius="var(--zp-radius-pill)" />
        <Skeleton width={110} height={30} radius="var(--zp-radius-pill)" />
        <Skeleton width={110} height={30} radius="var(--zp-radius-pill)" />
      </div>
      <div style={{ height: 1, background: 'var(--zp-line)' }} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0, border: '1px solid var(--zp-line)', borderRadius: 'var(--zp-radius)' }}>
        <div style={{ width: 360, flex: 'none', borderRight: '1px solid var(--zp-line)', padding: 'var(--zp-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-3)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={16} />
          ))}
        </div>
        <div style={{ flex: 1, padding: 'var(--zp-space-5) var(--zp-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)' }}>
          <Skeleton width={220} height={22} />
          <Skeleton height={1} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={40} />
          ))}
        </div>
      </div>
    </div>
  )
}
