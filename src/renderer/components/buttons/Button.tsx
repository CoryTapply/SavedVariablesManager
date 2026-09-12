import React from 'react'

const INTENTS = { primary: 'zp-primary', secondary: 'zp-secondary', ghost: 'zp-ghost', danger: 'zp-danger' } as const
const SIZES = { sm: 'zp-sm', md: '', lg: 'zp-lg' } as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  intent = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = ['zp-btn', INTENTS[intent] || INTENTS.secondary, SIZES[size] || '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            border: '1.5px solid var(--zp-line-accent)',
            borderTopColor: 'transparent',
            animation: 'zp-spin .7s linear infinite',
            flex: '0 0 auto'
          }}
        />
      ) : icon ? (
        <span style={{ display: 'inline-flex', flex: '0 0 auto' }}>{icon}</span>
      ) : null}
      {children ? <span>{children}</span> : null}
    </button>
  )
}
