import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export function Input({ invalid = false, className = '', ...rest }: InputProps) {
  return <input className={['zp-in', invalid ? 'zp-in-err' : '', className].filter(Boolean).join(' ')} {...rest} />
}
