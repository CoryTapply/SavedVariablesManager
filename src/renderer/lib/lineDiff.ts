export type LineDiffOp =
  | { type: 'equal'; oldLine: string; newLine: string }
  | { type: 'remove'; oldLine: string }
  | { type: 'add'; newLine: string }

/** Cap on dp-table cells (rows * cols) before falling back to a single "everything changed"
 * op - an O(n*m) LCS table is fine for typical short field values but must not blow up on a
 * pathologically large embedded script. */
const MAX_DP_CELLS = 4_000_000

/** Classic LCS-based line diff (same shape as Unix `diff`): returns an ordered sequence of
 * equal/remove/add line operations. Used to highlight exactly which lines changed between
 * two multi-line field values, rather than just showing two opaque blobs. */
export function diffLines(oldText: string, newText: string): LineDiffOp[] {
  const a = oldText.split('\n')
  const b = newText.split('\n')
  const n = a.length
  const m = b.length

  if (n * m > MAX_DP_CELLS) {
    const ops: LineDiffOp[] = []
    for (const line of a) ops.push({ type: 'remove', oldLine: line })
    for (const line of b) ops.push({ type: 'add', newLine: line })
    return ops
  }

  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
    }
  }

  const ops: LineDiffOp[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', oldLine: a[i]!, newLine: b[j]! })
      i += 1
      j += 1
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ type: 'remove', oldLine: a[i]! })
      i += 1
    } else {
      ops.push({ type: 'add', newLine: b[j]! })
      j += 1
    }
  }
  while (i < n) {
    ops.push({ type: 'remove', oldLine: a[i]! })
    i += 1
  }
  while (j < m) {
    ops.push({ type: 'add', newLine: b[j]! })
    j += 1
  }
  return ops
}
