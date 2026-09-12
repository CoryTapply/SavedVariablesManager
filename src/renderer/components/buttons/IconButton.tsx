import React from 'react'
import { Button, type ButtonProps } from './Button'

export interface IconButtonProps extends Omit<ButtonProps, 'icon'> {
  label: string
}

export function IconButton({
  label,
  size = 'md',
  intent = 'secondary',
  children,
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <Button
      intent={intent}
      size={size}
      aria-label={label}
      className={['zp-icon', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Button>
  )
}
