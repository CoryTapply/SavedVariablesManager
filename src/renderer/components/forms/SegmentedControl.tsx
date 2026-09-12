import React from 'react'

export interface SegmentOption {
  value: string
  label: string
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options?: ReadonlyArray<string | SegmentOption>
  value?: string
  onChange?: (next: string) => void
}

export function SegmentedControl({ options = [], value, onChange, style, ...rest }: SegmentedControlProps) {
  const wrap = React.useRef<HTMLDivElement | null>(null)
  const btns = React.useRef<Array<HTMLButtonElement | null>>([])
  const [thumb, setThumb] = React.useState<{ x: number; w: number } | null>(null)
  // First measured position lands without animation; later ones slide.
  const settled = React.useRef(false)

  const index = options.findIndex((o) => (typeof o === 'string' ? o : o.value) === value)

  const measure = React.useCallback(() => {
    const host = wrap.current
    const el = btns.current[index]
    if (!host || !el) {
      setThumb(null)
      return
    }
    setThumb({ x: el.offsetLeft, w: el.offsetWidth })
  }, [index])

  React.useLayoutEffect(() => {
    measure()
  }, [measure, options.length])

  React.useEffect(() => {
    if (thumb)
      requestAnimationFrame(() => {
        settled.current = true
      })
  }, [thumb])

  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !wrap.current) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div
      ref={wrap}
      role="tablist"
      style={{
        display: 'flex',
        padding: 3,
        gap: 3,
        borderRadius: 'var(--zp-radius)',
        border: '1px solid var(--zp-line-strong)',
        background: 'var(--zp-surface-inset)',
        width: 'fit-content',
        position: 'relative',
        ...style
      }}
      {...rest}
    >
      {thumb && (
        <span
          className="zp-seg-thumb"
          aria-hidden="true"
          data-init={settled.current ? undefined : '1'}
          style={{ width: thumb.w, transform: `translateX(${thumb.x}px)` }}
        />
      )}
      {options.map((o, i) => {
        const v = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        const on = v === value
        return (
          <button
            key={v}
            ref={(el) => {
              btns.current[i] = el
            }}
            role="tab"
            aria-selected={on}
            onClick={onChange ? () => onChange(v) : undefined}
            className="zp-seg-btn"
            style={{
              border: '1px solid transparent',
              background: 'transparent',
              color: on ? 'var(--zp-accent-100)' : 'var(--zp-text-3)'
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
