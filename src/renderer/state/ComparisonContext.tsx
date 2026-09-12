import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { DiscoveredAccounts } from '@shared/addonTypes'
import type { ComparisonResult } from '@shared/diffTypes'
import { invoke } from '../lib/ipc'
import type { FileSelection } from './fileSelection'

export interface WowFlavorOption {
  flavor: string
  label: string
}

interface ComparisonContextValue {
  wowRoot: string | null
  accounts: DiscoveredAccounts | null
  loadingAccounts: boolean
  chooseWowRoot: () => Promise<void>
  refreshAccounts: () => Promise<void>
  flavorOptions: WowFlavorOption[]
  selectedFlavor: string | null
  setSelectedFlavor: (flavor: string) => void
  comparisonResult: ComparisonResult | null
  comparing: boolean
  compareError: string | null
  runComparison: (fileA: string, fileB: string) => Promise<void>
  clearComparison: () => void
  selectedAddonId: string
  setSelectedAddonId: (addonId: string) => void
  fileA: FileSelection | null
  setFileA: (file: FileSelection | null) => void
  fileB: FileSelection | null
  setFileB: (file: FileSelection | null) => void
  accountNameA: string
  setAccountNameA: (name: string) => void
  accountNameB: string
  setAccountNameB: (name: string) => void
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

/** Best-effort default when the user has never picked a flavor before: prefer whichever
 * discovered flavor folder is the Anniversary/Classic Era one, since that's what this app's
 * primary user actually plays - falls back to the first discovered flavor otherwise. Only
 * used once; any real choice (including this default, once shown) is persisted afterwards. */
function guessDefaultFlavor(options: WowFlavorOption[]): string | null {
  if (options.length === 0) return null
  const era = options.find((o) => o.flavor.toLowerCase().includes('classic_era'))
  return (era ?? options[0])!.flavor
}

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [wowRoot, setWowRoot] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<DiscoveredAccounts | null>(null)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [flavorPreference, setFlavorPreference] = useState<string | null>(null)
  const [selectedFlavor, setSelectedFlavorState] = useState<string | null>(null)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [comparing, setComparing] = useState(false)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [selectedAddonId, setSelectedAddonId] = useState<string>('')
  const [fileA, setFileA] = useState<FileSelection | null>(null)
  const [fileB, setFileB] = useState<FileSelection | null>(null)
  const [accountNameA, setAccountNameA] = useState<string>('')
  const [accountNameB, setAccountNameB] = useState<string>('')

  const flavorOptions = React.useMemo<WowFlavorOption[]>(() => {
    if (!accounts) return []
    const byFlavor = new Map<string, string>()
    for (const account of accounts.accounts) byFlavor.set(account.flavor, account.flavorLabel)
    return Array.from(byFlavor, ([flavor, label]) => ({ flavor, label }))
  }, [accounts])

  const setSelectedFlavor = useCallback((flavor: string) => {
    setSelectedFlavorState(flavor)
    void invoke('wow:setFlavorPreference', flavor)
  }, [])

  useEffect(() => {
    if (flavorOptions.length === 0) return
    if (flavorPreference && flavorOptions.some((o) => o.flavor === flavorPreference)) {
      setSelectedFlavorState(flavorPreference)
      return
    }
    if (selectedFlavor && flavorOptions.some((o) => o.flavor === selectedFlavor)) return
    setSelectedFlavorState(guessDefaultFlavor(flavorOptions))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavorOptions, flavorPreference])

  const refreshAccounts = useCallback(async () => {
    setLoadingAccounts(true)
    try {
      const discovered = await invoke('wow:discover', undefined)
      setAccounts(discovered)
    } finally {
      setLoadingAccounts(false)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      const [root, savedFlavor] = await Promise.all([
        invoke('wow:getRoot', undefined),
        invoke('wow:getFlavorPreference', undefined)
      ])
      setWowRoot(root)
      setFlavorPreference(savedFlavor)
      if (root) await refreshAccounts()
    })()
  }, [refreshAccounts])

  const chooseWowRoot = useCallback(async () => {
    const chosen = await invoke('wow:chooseRoot', undefined)
    if (chosen) {
      setWowRoot(chosen)
      await refreshAccounts()
    }
  }, [refreshAccounts])

  const runComparison = useCallback(async (fileA: string, fileB: string) => {
    setComparing(true)
    setCompareError(null)
    try {
      const result = await invoke('compare:run', { fileA, fileB })
      setComparisonResult(result)
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : String(err))
    } finally {
      setComparing(false)
    }
  }, [])

  const clearComparison = useCallback(() => {
    setComparisonResult(null)
    setCompareError(null)
  }, [])

  return (
    <ComparisonContext.Provider
      value={{
        wowRoot,
        accounts,
        loadingAccounts,
        chooseWowRoot,
        refreshAccounts,
        flavorOptions,
        selectedFlavor,
        setSelectedFlavor,
        comparisonResult,
        comparing,
        compareError,
        runComparison,
        clearComparison,
        selectedAddonId,
        setSelectedAddonId,
        fileA,
        setFileA,
        fileB,
        setFileB,
        accountNameA,
        setAccountNameA,
        accountNameB,
        setAccountNameB
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext)
  if (!ctx) throw new Error('useComparison must be used within a ComparisonProvider')
  return ctx
}
