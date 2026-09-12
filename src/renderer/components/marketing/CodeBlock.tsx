import React from 'react'

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string
  filename?: string
  language?: string
  lineNumbers?: boolean
}

/* One pass, five token classes. Each pass of a multi-pass highlighter would
   re-scan the markup the previous pass injected (and `class` is itself a
   keyword), so the whole line is matched once and every unmatched chunk is
   escaped as it goes. A design system should not ship a parser. */
const TOKEN =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b(?:const|let|var|function|return|if|else|for|of|in|new|await|async|import|from|export|type|interface|class|extends|null|undefined|true|false)\b)|(\b[A-Za-z_$][\w$]*(?=\())/g

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function mark(line: string) {
  let out = ''
  let last = 0
  let m: RegExpExecArray | null
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(line))) {
    out += esc(line.slice(last, m.index))
    const kind = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'num' : m[4] ? 'key' : 'fn'
    out += '<span class="zp-tok-' + kind + '">' + esc(m[0]) + '</span>'
    last = m.index + m[0].length
  }
  return out + esc(line.slice(last))
}

export function CodeBlock({ code, filename, language, lineNumbers = false, style, ...rest }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const lines = String(code).replace(/\n$/, '').split('\n')
  const copy = () => {
    if (navigator.clipboard) void navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div
      style={{
        boxSizing: 'border-box',
        borderRadius: 'var(--zp-radius)',
        border: '1px solid var(--zp-line)',
        background: 'var(--zp-surface-field)',
        overflow: 'hidden',
        ...style
      }}
      {...rest}
    >
      {filename || language ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--zp-space-3)',
            padding: '7px var(--zp-space-3)',
            borderBottom: '1px solid var(--zp-line)',
            background: 'var(--zp-surface-1)'
          }}
        >
          <span
            style={{
              font: 'var(--zp-text-micro)',
              letterSpacing: 'var(--zp-tracking-micro)',
              textTransform: 'uppercase',
              color: 'var(--zp-text-4)'
            }}
          >
            {filename || language}
          </span>
          <button onClick={copy} className="zp-btn zp-ghost zp-sm" style={{ height: 22, padding: '0 8px' }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : null}
      <pre
        className="zp-code"
        style={{ margin: 0, padding: 'var(--zp-space-4)', overflowX: 'auto', font: 'var(--zp-text-data)', color: 'var(--zp-text-2)' }}
      >
        <code>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--zp-space-4)', minHeight: '1.4em' }}>
              {lineNumbers ? (
                <span style={{ flex: '0 0 auto', width: 18, textAlign: 'right', color: 'var(--zp-text-4)', userSelect: 'none' }}>
                  {i + 1}
                </span>
              ) : null}
              <span style={{ whiteSpace: 'pre' }} dangerouslySetInnerHTML={{ __html: mark(line) || ' ' }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}
