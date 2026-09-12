import React from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
  options?: Array<string | SelectOption>
}

export function Select({ invalid = false, options, children, className = '', ...rest }: SelectProps) {
  return (
    <span className="zp-sel-wrap">
      <select className={['zp-in', 'zp-sel', invalid ? 'zp-in-err' : '', className].filter(Boolean).join(' ')} {...rest}>
        {options
          ? options.map((o) => {
              const value = typeof o === 'string' ? o : o.value
              const label = typeof o === 'string' ? o : o.label
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            })
          : children}
      </select>
      <span className="zp-sel-arrow" aria-hidden="true">
        ▾
      </span>
    </span>
  )
}
