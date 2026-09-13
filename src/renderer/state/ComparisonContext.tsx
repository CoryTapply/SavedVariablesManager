import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { AccountMetaMap, DiscoveredAccounts } from '@shared/addonTypes'
import type { ComparisonResult } from '@shared/diffTypes'
import { invoke } from '../lib/ipc'
import type { FileSelection } from './fileSelection'

export interface WowFlavorOption {
  flavor: string
  label: string
}

export type CompareFilter = 'all' | 'added' | 'removed' | 'changed'

interface CompareState {
  compared: boolean
  filter: CompareFilter
  query: string
  selectedAuraId: string | null
}

type CompareAction =
  | { type: 'compared' }
  | { type: 'changeSelection' }
  | { type: 'toggleFilter'; kind: Exclude<CompareFilter, 'all'> }
  | { type: 'setFilter'; filter: CompareFilter }
  | { type: 'clearFilter' }
  | { type: 'setQuery'; query: string }
  | { type: 'selectAura'; id: string | null }

const initialCompareState: CompareState = { compared: false, filter: 'all', query: '', selectedAuraId: null }

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case 'compared':
      return { ...state, compared: true }
    case 'changeSelection':
      // Preserves A/B/addon/flavor/selectedAuraId - only the compared flag and filter reset.
      return { ...state, compared: false, filter: 'all' }
    case 'toggleFilter':
      return { ...state, filter: state.filter === action.kind ? 'all' : action.kind }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearFilter':
      return { ...state, filter: 'all' }
    case 'setQuery':
      return { ...state, query: action.query }
    case 'selectAura':
      return { ...state, selectedAuraId: action.id }
    default:
      return state
  }
}

export interface AccountLabel {
  label: string
  sub?: string
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
  runComparison: () => Promise<void>
  changeSelection: () => void
  selectedAddonId: string
  setSelectedAddonId: (addonId: string) => void
  fileA: FileSelection | null
  fileB: FileSelection | null
  accountNameA: string
  setAccountNameA: (name: string) => void
  accountNameB: string
  setAccountNameB: (name: string) => void
  swapAccounts: () => void
  copyDestination: FileSelection | null
  compared: boolean
  filter: CompareFilter
  toggleFilter: (kind: Exclude<CompareFilter, 'all'>) => void
  setFilter: (filter: CompareFilter) => void
  clearFilter: () => void
  query: string
  setQuery: (query: string) => void
  selectedAuraId: string | null
  selectAura: (id: string | null) => void
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  accountMeta: AccountMetaMap
  saveAccountMeta: (next: AccountMetaMap) => Promise<void>
  labelForAccount: (accountName: string) => AccountLabel
  sortedAccounts: (accounts: DiscoveredAccounts['accounts']) => DiscoveredAccounts['accounts']
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

function basename(path: string): string {
  return path.split(/[/\\]/).pop() ?? path
}

/** `dir` comes from the main process (an OS-native absolute path), so join using whichever
 * separator it already uses rather than assuming the renderer's own platform. */
function joinPath(dir: string, fileName: string): string {
  const sep = dir.includes('\\') && !dir.includes('/') ? '\\' : '/'
  return dir.endsWith(sep) ? `${dir}${fileName}` : `${dir}${sep}${fileName}`
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
  const [selectedAddonId, setSelectedAddonIdState] = useState<string>('')
  const [accountNameA, setAccountNameAState] = useState<string>('')
  const [accountNameB, setAccountNameBState] = useState<string>('')
  const [accountMeta, setAccountMetaState] = useState<AccountMetaMap>({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [compareState, dispatch] = useReducer(compareReducer, initialCompareState)

  const flavorOptions = useMemo<WowFlavorOption[]>(() => {
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

  // Persist addon/account-A/account-B selection as one object - fire-and-forget, same pattern
  // as setSelectedFlavor, so re-launching the app lands back on the same pair.
  const persistSelection = useCallback((addonId: string, a: string, b: string) => {
    if (!addonId && !a && !b) return
    void invoke('compare:setSelectionPreference', { addonId, accountA: a, accountB: b })
  }, [])

  const setSelectedAddonId = useCallback(
    (addonId: string) => {
      setSelectedAddonIdState(addonId)
      persistSelection(addonId, accountNameA, accountNameB)
    },
    [accountNameA, accountNameB, persistSelection]
  )
  const setAccountNameA = useCallback(
    (name: string) => {
      setAccountNameAState(name)
      persistSelection(selectedAddonId, name, accountNameB)
    },
    [selectedAddonId, accountNameB, persistSelection]
  )
  const setAccountNameB = useCallback(
    (name: string) => {
      setAccountNameBState(name)
      persistSelection(selectedAddonId, accountNameA, name)
    },
    [selectedAddonId, accountNameA, persistSelection]
  )
  const swapAccounts = useCallback(() => {
    setAccountNameAState(accountNameB)
    setAccountNameBState(accountNameA)
    persistSelection(selectedAddonId, accountNameB, accountNameA)
  }, [accountNameA, accountNameB, selectedAddonId, persistSelection])

  useEffect(() => {
    void (async () => {
      const [root, savedFlavor, savedSelection, savedAccountMeta] = await Promise.all([
        invoke('wow:getRoot', undefined),
        invoke('wow:getFlavorPreference', undefined),
        invoke('compare:getSelectionPreference', undefined),
        invoke('settings:getAccountMeta', undefined)
      ])
      setWowRoot(root)
      setFlavorPreference(savedFlavor)
      setAccountMetaState(savedAccountMeta)
      if (savedSelection) {
        setSelectedAddonIdState(savedSelection.addonId)
        setAccountNameAState(savedSelection.accountA)
        setAccountNameBState(savedSelection.accountB)
      }
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

  // The addon is chosen once for both sides, so each side's "file" is always a pure function of
  // (accounts, that side's account name, the shared addon id) - never picked directly.
  const resolveFile = useCallback(
    (accountName: string): FileSelection | null => {
      if (!accountName || !selectedAddonId) return null
      const account = accounts?.accounts.find((a) => a.accountName === accountName)
      const file = account?.files.find((f) => f.addonId === selectedAddonId)
      return file
        ? { filePath: file.filePath, label: file.displayName, depth: file.depth, fileSizeBytes: file.fileSizeBytes }
        : null
    },
    [accounts, selectedAddonId]
  )
  const fileA = useMemo(() => resolveFile(accountNameA), [resolveFile, accountNameA])
  const fileB = useMemo(() => resolveFile(accountNameB), [resolveFile, accountNameB])

  // Account B doesn't need an existing file for the addon to be a valid copy destination - only
  // comparison requires a real file on both sides. When it has none yet, fall back to where that
  // file would land (its SavedVariables folder + account A's file name).
  const copyDestination = useMemo<FileSelection | null>(() => {
    if (fileB) return fileB
    if (!fileA || !accountNameB) return null
    const accountBEntry = accounts?.accounts.find((a) => a.accountName === accountNameB)
    if (!accountBEntry?.savedVariablesDir) return null
    const fileName = basename(fileA.filePath)
    return { filePath: joinPath(accountBEntry.savedVariablesDir, fileName), label: fileName }
  }, [fileB, fileA, accountNameB, accounts])

  const runComparison = useCallback(async () => {
    if (!fileA || !fileB) return
    setComparing(true)
    setCompareError(null)
    try {
      const result = await invoke('compare:run', { fileA: fileA.filePath, fileB: fileB.filePath })
      setComparisonResult(result)
      dispatch({ type: 'compared' })
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : String(err))
    } finally {
      setComparing(false)
    }
  }, [fileA, fileB])

  const changeSelection = useCallback(() => {
    dispatch({ type: 'changeSelection' })
  }, [])

  const toggleFilter = useCallback((kind: Exclude<CompareFilter, 'all'>) => {
    dispatch({ type: 'toggleFilter', kind })
  }, [])
  const setFilter = useCallback((filter: CompareFilter) => dispatch({ type: 'setFilter', filter }), [])
  const clearFilter = useCallback(() => dispatch({ type: 'clearFilter' }), [])
  const setQuery = useCallback((query: string) => dispatch({ type: 'setQuery', query }), [])
  const selectAura = useCallback((id: string | null) => dispatch({ type: 'selectAura', id }), [])

  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const saveAccountMeta = useCallback(async (next: AccountMetaMap) => {
    setAccountMetaState(next)
    await invoke('settings:setAccountMeta', next)
  }, [])

  const labelForAccount = useCallback(
    (accountName: string): AccountLabel => {
      const meta = accountMeta[accountName]
      if (meta?.name) return { label: meta.name, sub: accountName }
      return { label: accountName }
    },
    [accountMeta]
  )

  const sortedAccounts = useCallback(
    (list: DiscoveredAccounts['accounts']): DiscoveredAccounts['accounts'] => {
      return list
        .map((account, index) => ({ account, index }))
        .sort((x, y) => {
          const favX = accountMeta[x.account.accountName]?.favorite ? 0 : 1
          const favY = accountMeta[y.account.accountName]?.favorite ? 0 : 1
          if (favX !== favY) return favX - favY
          return x.index - y.index
        })
        .map((x) => x.account)
    },
    [accountMeta]
  )

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
        changeSelection,
        selectedAddonId,
        setSelectedAddonId,
        fileA,
        fileB,
        accountNameA,
        setAccountNameA,
        accountNameB,
        setAccountNameB,
        swapAccounts,
        copyDestination,
        compared: compareState.compared,
        filter: compareState.filter,
        toggleFilter,
        setFilter,
        clearFilter,
        query: compareState.query,
        setQuery,
        selectedAuraId: compareState.selectedAuraId,
        selectAura,
        settingsOpen,
        openSettings,
        closeSettings,
        accountMeta,
        saveAccountMeta,
        labelForAccount,
        sortedAccounts
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
