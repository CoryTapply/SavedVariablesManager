/**
 * Same one-pass token highlighter as the Zerpy `CodeBlock` component (kept duplicated here,
 * not imported from it, since CodeBlock is a faithful copy of the design system source and
 * this is app-specific: DiffCodeBlock needs the token spans per-line, layered under its own
 * diff-background tinting, rather than CodeBlock's whole-block rendering).
 */
const TOKEN =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b(?:const|let|var|function|return|if|else|for|of|in|new|await|async|import|from|export|type|interface|class|extends|null|undefined|true|false|local|then|end|elseif|nil)\b)|(\b[A-Za-z_$][\w$]*(?=\())/g

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlightLine(line: string): string {
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
