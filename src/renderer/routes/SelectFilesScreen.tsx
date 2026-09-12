import React, { useEffect, useMemo, useState } from 'react'
import { PageShell } from '../components/surfaces/PageShell'
import { SectionHeading } from '../components/surfaces/SectionHeading'
import { Button } from '../components/buttons/Button'
import { EmptyState } from '../components/feedback/EmptyState'
import { Toast, ToastStack } from '../components/feedback/Toast'
import { Select } from '../components/forms/Select'
import { IconButton } from '../components/buttons/IconButton'
import { CogIcon } from '../components/icons/Cog'
import { AccountFilePicker } from '../components/app/AccountFilePicker'
import { AddonPicker } from '../components/app/AddonPicker'
import { useComparison } from '../state/ComparisonContext'
import type { FileSelection } from '../state/fileSelection'
import { computeAddonOptions } from '../lib/addonPriority'
import { invoke } from '../lib/ipc'

const COPY_TOAST_DURATION_MS = 6000

interface CopyToast {
  tone: 'success' | 'danger'
  title: string
  body: string
  /** File to reveal in Finder/Explorer when the toast is clicked - the backup if one was
   * made, otherwise the freshly-copied destination file. Null when the copy failed. */
  revealPath: string | null
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

export function SelectFilesScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
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
    setFileA,
    fileB,
    setFileB,
    accountNameA,
    setAccountNameA,
    accountNameB,
    setAccountNameB,
    selectedAddonId,
    setSelectedAddonId
  } = useComparison()
  const [copying, setCopying] = useState(false)
  const [copyToast, setCopyToast] = useState<CopyToast | null>(null)

  const canCompare = Boolean(fileA && fileB) && !comparing

  const visibleAccounts = useMemo(() => {
    if (!accounts) return null
    if (!selectedFlavor) return accounts
    return { ...accounts, accounts: accounts.accounts.filter((a) => a.flavor === selectedFlavor) }
  }, [accounts, selectedFlavor])

  const addonOptions = useMemo(() => computeAddonOptions(visibleAccounts), [visibleAccounts])
  const selectedAddonLabel = useMemo(
    () =>
      addonOptions.cards.find((c) => c.addonId === selectedAddonId)?.label ??
      addonOptions.rest.find((a) => a.addonId === selectedAddonId)?.displayName,
    [addonOptions, selectedAddonId]
  )

  // Default to the first (highest-priority) addon card once accounts finish loading, so the
  // common case (comparing WeakAuras) needs no extra click.
  useEffect(() => {
    if (selectedAddonId) return
    if (addonOptions.cards.length > 0) setSelectedAddonId(addonOptions.cards[0]!.addonId)
  }, [addonOptions, selectedAddonId])

  // Account B doesn't need an existing file for the addon to be a valid copy destination -
  // only comparison requires a real file on both sides. When it has none yet, fall back to
  // where that file would land (its SavedVariables folder + account A's file name).
  const copyDestination = useMemo<FileSelection | null>(() => {
    if (fileB) return fileB
    if (!fileA || !accountNameB) return null
    const accountBEntry = visibleAccounts?.accounts.find((a) => a.accountName === accountNameB)
    if (!accountBEntry?.savedVariablesDir) return null
    const fileName = basename(fileA.filePath)
    return { filePath: joinPath(accountBEntry.savedVariablesDir, fileName), label: fileName }
  }, [fileB, fileA, accountNameB, visibleAccounts])

  const canCopy =
    Boolean(fileA && copyDestination && accountNameB) && fileA?.filePath !== copyDestination?.filePath && !copying

  // Auto-dismiss, same as any toast - the click-to-reveal affordance stays available the
  // whole time it's up.
  useEffect(() => {
    if (!copyToast) return
    const timer = setTimeout(() => setCopyToast(null), COPY_TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [copyToast])

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    await runComparison(fileA.filePath, fileB.filePath)
  }

  const handleCopy = async () => {
    if (!fileA || !copyDestination || !accountNameB) return
    setCopying(true)
    const addonLabel = selectedAddonLabel ?? 'file'
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
          title: `Copied ${addonLabel} to account B`,
          body: result.backupPath
            ? "Account B's previous file was backed up. Click to view it."
            : 'Account B had no prior file to back up. Click to view the copied file.',
          revealPath: result.backupPath ?? copyDestination.filePath
        })
      } else {
        setCopyToast({ tone: 'danger', title: `Copy to account B failed`, body: result.message, revealPath: null })
      }
    } catch (err) {
      setCopyToast({
        tone: 'danger',
        title: 'Copy to account B failed',
        body: err instanceof Error ? err.message : String(err),
        revealPath: null
      })
    } finally {
      setCopying(false)
    }
  }

  return (
    <PageShell maxWidth={1200}>
      <SectionHeading
        eyebrow="WoW Addon Comparator"
        title="Compare SavedVariables files"
        description="Pick two accounts to see what changed between their SavedVariables files."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-3)' }}>
            {flavorOptions.length > 1 ? (
              <Select
                value={selectedFlavor ?? ''}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                options={flavorOptions.map((o) => ({ value: o.flavor, label: o.label }))}
              />
            ) : null}
            <IconButton label="Settings" onClick={onOpenSettings}>
              <CogIcon />
            </IconButton>
          </div>
        }
      />

      {!wowRoot ? (
        <EmptyState
          glyph="WoW"
          title="No WoW folder set"
          body="Point this app at your World of Warcraft install folder in Settings to auto-detect accounts."
          action={
            <Button intent="primary" onClick={onOpenSettings}>
              Open Settings…
            </Button>
          }
        />
      ) : null}

      <AddonPicker options={addonOptions} value={selectedAddonId} onChange={setSelectedAddonId} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--zp-space-6)' }}>
        <AccountFilePicker
          title="Account A"
          accounts={visibleAccounts}
          addonId={selectedAddonId}
          addonLabel={selectedAddonLabel}
          accountName={accountNameA}
          onAccountNameChange={setAccountNameA}
          value={fileA}
          onChange={setFileA}
        />
        <AccountFilePicker
          title="Account B"
          accounts={visibleAccounts}
          addonId={selectedAddonId}
          addonLabel={selectedAddonLabel}
          accountName={accountNameB}
          onAccountNameChange={setAccountNameB}
          value={fileB}
          onChange={setFileB}
        />
      </div>

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

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-4)' }}>
        <Button intent="primary" size="lg" disabled={!canCompare} loading={comparing} onClick={() => void handleCompare()}>
          Compare
        </Button>
        <Button intent="ghost" disabled={!canCopy} loading={copying} onClick={() => void handleCopy()}>
          Copy account A → account B
        </Button>
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
    </PageShell>
  )
}
