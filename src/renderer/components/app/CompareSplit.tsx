import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { CompareListItem } from '../../lib/compareListItems'
import { useComparison } from '../../state/ComparisonContext'
import { AuraList } from './AuraList'
import { AuraDetailPane } from './AuraDetailPane'

interface CompareSplitProps {
  allItems: CompareListItem[]
  statFilteredItems: CompareListItem[]
  otherRootKeys: { onlyInA: string[]; onlyInB: string[] }
}

const STACK_BREAKPOINT = 820

/** README §2.2 - the master-detail split. Stacks list above detail below ~820px total width. */
export function CompareSplit({ allItems, statFilteredItems, otherRootKeys }: CompareSplitProps) {
  const { accountNameA, accountNameB, query, setQuery, selectedAuraId, selectAura } = useComparison()

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return statFilteredItems
    return statFilteredItems.filter(
      (item) => item.name.toLowerCase().includes(q) || (item.group ?? '').toLowerCase().includes(q)
    )
  }, [statFilteredItems, query])

  // If the current selection is filtered out, fall back to the first visible row - but only
  // when there IS a visible row. When the filter/search yields nothing, leave the selection
  // (and therefore the detail pane) exactly as it was (README: "Filter yields nothing").
  useEffect(() => {
    if (visibleItems.length === 0) return
    if (visibleItems.some((i) => i.id === selectedAuraId)) return
    selectAura(visibleItems[0]!.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleItems])

  const selectedItem = useMemo(() => allItems.find((i) => i.id === selectedAuraId) ?? null, [allItems, selectedAuraId])

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setStacked(entry.contentRect.width < STACK_BREAKPOINT)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      className="zp-open-below"
      style={{ flex: 1, display: 'flex', flexDirection: stacked ? 'column' : 'row', alignItems: 'stretch', minHeight: 0 }}
    >
      <AuraList
        items={visibleItems}
        selectedId={selectedAuraId}
        onSelect={selectAura}
        query={query}
        onQueryChange={setQuery}
        stacked={stacked}
      />
      <AuraDetailPane item={selectedItem} accountNameA={accountNameA} accountNameB={accountNameB} otherRootKeys={otherRootKeys} />
    </div>
  )
}
