import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string
  height?: number | string
  radius?: number | string
  shape?: 'shimmer' | 'pulse'
}

export function Skeleton({ width = '100%', height = 10, radius, shape = 'shimmer', style, children, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={shape === 'pulse' ? 'zp-sk-pulse' : 'zp-sk'}
      style={{
        width,
        height,
        borderRadius: radius != null ? radius : 'var(--zp-radius-xs)',
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
