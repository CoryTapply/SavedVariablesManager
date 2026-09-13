import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/buttons/Button'
import { EmptyState } from '../components/feedback/EmptyState'
import { Toast, ToastStack } from '../components/feedback/Toast'
import { IconButton } from '../components/buttons/IconButton'
import { CogIcon } from '../components/icons/Cog'
import { CommandBar } from '../components/app/CommandBar'
import { FlavorSelect } from '../components/app/FlavorSelect'
import { ContextStrip } from '../components/app/ContextStrip'
import { CompareSplit } from '../components/app/CompareSplit'
import { CompareSkeleton } from '../components/app/CompareSkeleton'
import { useComparison } from '../state/ComparisonContext'
import { computeAddonOptions } from '../lib/addonPriority'
import { buildCompareListItems } from '../lib/compareListItems'
import { accountSuffix } from '../lib/format'
import { invoke } from '../lib/ipc'
import type { DiscoveredAccounts } from '@shared/addonTypes'

const COPY_TOAST_DURATION_MS = 8000

interface CopyToast {
  tone: 'success' | 'danger'
  title: string
  body: React.ReactNode
  /** File to reveal in Finder/Explorer when the toast is clicked - the backup file when one was
   * made, otherwise the freshly-copied destination file. Null when the copy failed. */
  revealPath: string | null
}

function basename(path: string): string {
  return path.split(/[/\\]/).pop() ?? path
}

/** Single continuously-mounted compare screen (README: "one flow, not two screens"). Owns the
 * idle command bar vs. compared context strip + master-detail split, plus the copy toast and
 * the in-flight skeleton - none of these unmount each other, only conditionally render. */
export function CompareScreen() {
  const {
    wowRoot,
    accounts,
    flavorOptions,
    selectedFlavor,
    setSelectedFlavor,
    runComparison,
    comparing,
    compareError,
    fileA,
    fileB,
    accountNameA,
    setAccountNameA,
    accountNameB,
    setAccountNameB,
    swapAccounts,
    selectedAddonId,
    setSelectedAddonId,
    copyDestination,
    compared,
    changeSelection,
    comparisonResult,
    filter,
    toggleFilter,
    clearFilter,
    openSettings,
    labelForAccount,
    sortedAccounts
  } = useComparison()

  const [copying, setCopying] = useState(false)
  const [copyToast, setCopyToast] = useState<CopyToast | null>(null)

  const visibleAccounts = useMemo<DiscoveredAccounts | null>(() => {
    if (!accounts) return null
    const filtered = selectedFlavor ? accounts.accounts.filter((a) => a.flavor === selectedFlavor) : accounts.accounts
    return { ...accounts, accounts: sortedAccounts(filtered) }
  }, [accounts, selectedFlavor, sortedAccounts])

  const addonOptions = useMemo(() => computeAddonOptions(visibleAccounts), [visibleAccounts])
  const selectedAddonLabel = useMemo(
    () =>
      addonOptions.cards.find((c) => c.addonId === selectedAddonId)?.label ??
      addonOptions.rest.find((a) => a.addonId === selectedAddonId)?.displayName ??
      'addon',
    [addonOptions, selectedAddonId]
  )

  // Default to the first (highest-priority) addon card once accounts finish loading, so the
  // common case (comparing WeakAuras) needs no extra click - unless a prior session already
  // picked one (restored via compare:getSelectionPreference).
  useEffect(() => {
    if (selectedAddonId) return
    if (addonOptions.cards.length > 0) setSelectedAddonId(addonOptions.cards[0]!.addonId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addonOptions, selectedAddonId])

  const canCompare = Boolean(fileA && fileB) && !comparing
  const canCopy =
    Boolean(fileA && copyDestination && accountNameB) && fileA?.filePath !== copyDestination?.filePath && !copying

  useEffect(() => {
    if (!copyToast) return
    const timer = setTimeout(() => setCopyToast(null), COPY_TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [copyToast])

  const handleCompare = async () => {
    await runComparison()
  }

  const handleCopy = async () => {
    if (!fileA || !copyDestination || !accountNameB) return
    setCopying(true)
    const fileName = basename(fileA.filePath)
    const labelB = labelForAccount(accountNameB)
    const suffixB = labelB.sub ? labelB.label : accountSuffix(labelB.label)
    try {
      const result = await invoke('file:copyAddonFile', {
        source: fileA.filePath,
        destination: copyDestination.filePath,
        addonId: selectedAddonId,
        destinationAccountName: accountNameB
      })
      if (result.ok) {
        setCopyToast({
          tone: 'success',
          title: `Copied ${fileName} to account ${suffixB}`,
          body: (
            <>
              {result.backupPath ? 'Backup created. ' : 'No prior file to back up. '}
              <span style={{ color: 'var(--zp-accent-300)' }}>Click to open the folder in File Explorer</span>
            </>
          ),
          revealPath: result.backupPath ?? copyDestination.filePath
        })
      } else {
        setCopyToast({ tone: 'danger', title: `Copy to account ${suffixB} failed`, body: result.message, revealPath: null })
      }
    } catch (err) {
      setCopyToast({
        tone: 'danger',
        title: `Copy to account ${suffixB} failed`,
        body: err instanceof Error ? err.message : String(err),
        revealPath: null
      })
    } finally {
      setCopying(false)
    }
  }

  const comparison = comparisonResult?.result
  const listItems = useMemo(() => (comparison ? buildCompareListItems(comparison) : []), [comparison])
  const statFilteredItems = useMemo(
    () => (filter === 'all' ? listItems : listItems.filter((i) => i.kind === filter)),
    [listItems, filter]
  )
  const otherRootKeys = comparison?.depth === 'deep' ? comparison.otherRootKeys : { onlyInA: [], onlyInB: [] }
  const noDifferences = Boolean(
    comparison && comparison.summary.added + comparison.summary.removed + comparison.summary.changed === 0
  )

  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        height: '100%',
        color: 'var(--zp-text)',
        fontFamily: 'var(--zp-font-body)',
        background: 'var(--zp-ground)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 'var(--zp-starfield-opacity)', backgroundImage: 'var(--zp-starfield)' }}
      />

      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--zp-space-6)',
          padding: 'var(--zp-space-7) var(--zp-space-7) var(--zp-space-8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--zp-space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--zp-text-h1)', color: 'var(--zp-text)' }}>
              Compare SavedVariables files
            </span>
            <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)', margin: '6px 0 0' }}>
              Pick two accounts to see what changed between their SavedVariables files.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--zp-space-3)' }}>
            {flavorOptions.length > 1 ? (
              <FlavorSelect options={flavorOptions} value={selectedFlavor} onChange={setSelectedFlavor} />
            ) : null}
            <IconButton label="Settings" size="sm" onClick={openSettings}>
              <CogIcon size={14} />
            </IconButton>
          </div>
        </div>

        {!wowRoot ? (
          <EmptyState
            glyph="WoW"
            title="No WoW folder set"
            body="Point this app at your World of Warcraft install folder in Settings to auto-detect accounts."
            action={
              <Button intent="primary" onClick={openSettings}>
                Open Settings…
              </Button>
            }
          />
        ) : comparing ? (
          <CompareSkeleton />
        ) : compared && comparisonResult && comparison ? (
          <>
            <ContextStrip
              flavorLabel={flavorOptions.find((o) => o.flavor === selectedFlavor)?.label}
              addonLabel={selectedAddonLabel}
              accountNameA={accountNameA}
              accountNameB={accountNameB}
              fileA={fileA}
              fileB={fileB}
              labelForAccount={labelForAccount}
              onChangeSelection={changeSelection}
              depth={comparison.depth}
              summary={comparison.summary}
              filter={filter}
              onToggleFilter={toggleFilter}
              onClearFilter={clearFilter}
            />
            <div style={{ height: 1, background: 'var(--zp-line)' }} />
            {noDifferences ? (
              <div
                style={{
                  padding: 'var(--zp-space-8)',
                  textAlign: 'center',
                  borderRadius: 'var(--zp-radius)',
                  border: '1px solid var(--zp-line)',
                  background: 'var(--zp-surface-1)',
                  font: 'var(--zp-text-sm)',
                  color: 'var(--zp-text-4)'
                }}
              >
                These files are identical — nothing to compare.
              </div>
            ) : (
              <CompareSplit allItems={listItems} statFilteredItems={statFilteredItems} otherRootKeys={otherRootKeys} />
            )}
          </>
        ) : (
          <>
            <CommandBar
              addonOptions={addonOptions}
              selectedAddonId={selectedAddonId}
              onAddonChange={setSelectedAddonId}
              accounts={visibleAccounts?.accounts ?? []}
              accountNameA={accountNameA}
              accountNameB={accountNameB}
              onAccountAChange={setAccountNameA}
              onAccountBChange={setAccountNameB}
              onSwap={swapAccounts}
              labelForAccount={labelForAccount}
              fileA={fileA}
              fileB={fileB}
              addonLabel={selectedAddonLabel}
              canCompare={canCompare}
              comparing={comparing}
              onCompare={() => void handleCompare()}
              canCopy={canCopy}
              copying={copying}
              onCopy={() => void handleCopy()}
            />

            {compareError ? (
              <div
                style={{
                  padding: 'var(--zp-space-3)',
                  borderRadius: 'var(--zp-radius)',
                  border: '1px solid var(--zp-danger-line)',
                  background: 'var(--zp-danger-tint)',
                  font: 'var(--zp-text-sm)',
                  color: 'var(--zp-danger-text)'
                }}
              >
                {compareError}
              </div>
            ) : null}

            <div
              style={{
                flex: 1,
                padding: 'var(--zp-space-8)',
                textAlign: 'center',
                borderRadius: 'var(--zp-radius)',
                border: '1px solid var(--zp-line)',
                background: 'var(--zp-surface-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: 'var(--zp-text-sm)',
                color: 'var(--zp-text-4)'
              }}
            >
              Press Compare — this area becomes the comparison
            </div>
          </>
        )}
      </div>

      {copyToast ? (
        <ToastStack>
          <Toast
            tone={copyToast.tone}
            title={copyToast.title}
            body={copyToast.body}
            onDismiss={() => setCopyToast(null)}
            onClick={
              copyToast.revealPath ? () => void invoke('file:showInFolder', { path: copyToast.revealPath! }) : undefined
            }
          />
        </ToastStack>
      ) : null}
    </div>
  )
}
