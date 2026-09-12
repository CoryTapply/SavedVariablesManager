import React from 'react'

export interface CtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'orbit' | 'orbit-breathing' | 'breathing' | 'plain'
}

export function CtaButton({ variant = 'orbit', children, className = '', ...rest }: CtaButtonProps) {
  const orbit = variant === 'orbit' || variant === 'orbit-breathing'
  const cls = [
    'zp-cta',
    orbit ? 'zp-cta-orbit' : '',
    variant === 'orbit-breathing' || variant === 'breathing' ? 'zp-cta-pulse' : '',
    className
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} {...rest}>
      {orbit ? <span className="zp-ring" /> : null}
      {orbit ? <span className="zp-inner" /> : null}
      {orbit ? <span className="zp-label">{children}</span> : children}
    </button>
  )
}
