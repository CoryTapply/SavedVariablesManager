import React, { useEffect, useMemo, useState } from 'react'
import type { AccountMetaMap, AccountServerCharacters } from '@shared/addonTypes'
import { Dialog } from '../feedback/Dialog'
import { Field } from '../forms/Field'
import { Button } from '../buttons/Button'
import { Input } from '../forms/Input'
import { useComparison } from '../../state/ComparisonContext'
import { invoke } from '../../lib/ipc'

function PathRow({ path, loading, onChange, chooseLabel }: { path: string | null; loading: boolean; onChange: () => void; chooseLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-3)', flexWrap: 'wrap' }}>
      <span
        style={{
          flex: '1 1 auto',
          font: 'var(--zp-text-data)',
          color: path ? 'var(--zp-text-2)' : 'var(--zp-text-4)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {loading ? 'Loading…' : (path ?? 'Not set')}
      </span>
      <Button intent="secondary" size="sm" onClick={onChange} disabled={loading}>
        {path ? 'Change…' : chooseLabel}
      </Button>
    </div>
  )
}

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { wowRoot, chooseWowRoot, accounts, flavorOptions, selectedFlavor, accountMeta, saveAccountMeta } = useComparison()
  const [backupsDir, setBackupsDir] = useState<string | null>(null)
  const [loadingBackupsDir, setLoadingBackupsDir] = useState(true)
  const [draft, setDraft] = useState<AccountMetaMap>(accountMeta)
  const [openAccounts, setOpenAccounts] = useState<Record<string, boolean>>({})
  const [accountChars, setAccountChars] = useState<Record<string, AccountServerCharacters[] | undefined>>({})
  const [loadingChars, setLoadingChars] = useState<Record<string, boolean>>({})
  const [appVersion, setAppVersion] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const dir = await invoke('settings:getBackupsDir', undefined)
      setBackupsDir(dir)
      setLoadingBackupsDir(false)
    })()
  }, [])

  useEffect(() => {
    void invoke('app:getVersion', undefined).then(setAppVersion)
  }, [])

  const handleChooseBackupsDir = async () => {
    const chosen = await invoke('settings:chooseBackupsDir', undefined)
    if (chosen) setBackupsDir(chosen)
  }

  // Only the flavor picked in the compare screen's flavor selector - an account folder is
  // per-flavor on disk, so mixing flavors here would either show the wrong characters or
  // require disambiguating every row by flavor for no benefit (the selector already scopes
  // the rest of the app to one flavor at a time).
  const flavorAccounts = useMemo(
    () => accounts?.accounts.filter((a) => a.flavor === selectedFlavor) ?? [],
    [accounts, selectedFlavor]
  )
  const allAccounts = useMemo(() => flavorAccounts.map((a) => a.accountName), [flavorAccounts])
  const uniqueAccountNames = useMemo(() => Array.from(new Set(allAccounts)), [allAccounts])
  const sortedAccountNames = useMemo(
    () =>
      uniqueAccountNames
        .map((name, index) => ({ name, index }))
        .sort((x, y) => {
          const favX = draft[x.name]?.favorite ? 0 : 1
          const favY = draft[y.name]?.favorite ? 0 : 1
          if (favX !== favY) return favX - favY
          return x.index - y.index
        })
        .map((x) => x.name),
    [uniqueAccountNames, draft]
  )

  const toggleFavorite = (accountName: string) => {
    setDraft((prev) => ({
      ...prev,
      [accountName]: { name: prev[accountName]?.name ?? '', favorite: !prev[accountName]?.favorite }
    }))
  }
  const renameAccount = (accountName: string, name: string) => {
    setDraft((prev) => ({ ...prev, [accountName]: { name, favorite: prev[accountName]?.favorite ?? false } }))
  }

  const toggleExpanded = (accountName: string) => {
    const wasOpen = !!openAccounts[accountName]
    setOpenAccounts((prev) => ({ ...prev, [accountName]: !wasOpen }))
    if (wasOpen || accountChars[accountName] !== undefined) return

    const entry = flavorAccounts.find((a) => a.accountName === accountName)
    if (!entry) return

    setLoadingChars((prev) => ({ ...prev, [accountName]: true }))
    void (async () => {
      const servers = await invoke('wow:listAccountCharacters', { accountDir: entry.accountDir })
      setAccountChars((prev) => ({ ...prev, [accountName]: servers }))
      setLoadingChars((prev) => ({ ...prev, [accountName]: false }))
    })()
  }

  const handleSave = async () => {
    await saveAccountMeta(draft)
    onClose()
  }

  return (
    <Dialog
      title="Settings"
      description="Tell the app where World of Warcraft lives and where to keep backups."
      onClose={onClose}
      width={620}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-1)' }}>
            <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
              {flavorOptions.length} flavor{flavorOptions.length === 1 ? '' : 's'} detected · {uniqueAccountNames.length}{' '}
              account{uniqueAccountNames.length === 1 ? '' : 's'}
            </span>
            {appVersion ? (
              <span style={{ font: 'var(--zp-text-micro)', color: 'var(--zp-text-4)' }}>Version {appVersion}</span>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 'var(--zp-space-2)' }}>
            <Button intent="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button intent="primary" onClick={() => void handleSave()}>
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-6)' }}>
        <Field label="Game folder" hint="Accounts are read from WTF\Account inside each flavor folder found here.">
          <PathRow path={wowRoot} loading={false} onChange={() => void chooseWowRoot()} chooseLabel="Browse…" />
        </Field>
        <Field label="Backup location" hint="The target file is copied here before Copy A → B overwrites it.">
          <PathRow
            path={backupsDir}
            loading={loadingBackupsDir}
            onChange={() => void handleChooseBackupsDir()}
            chooseLabel="Browse…"
          />
        </Field>
        <Field
          label="Accounts"
          hint="Names are shown instead of the account number when you pick an account. Star an account to sort it to the top. Nothing on disk is renamed."
        >
          <div
            style={{
              border: '1px solid var(--zp-line)',
              borderRadius: 'var(--zp-radius)',
              background: 'var(--zp-surface-1)',
              maxHeight: 176,
              overflowY: 'auto'
            }}
          >
            {sortedAccountNames.length === 0 ? (
              <div style={{ padding: 'var(--zp-space-3)', font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
                No accounts detected yet.
              </div>
            ) : (
              sortedAccountNames.map((accountName) => {
                const meta = draft[accountName]
                const isOpen = !!openAccounts[accountName]
                const servers = accountChars[accountName]
                return (
                  <div key={accountName} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--zp-line)' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--zp-space-2)',
                        padding: '5px var(--zp-space-2) 5px 4px'
                      }}
                    >
                      <button
                        onClick={() => toggleFavorite(accountName)}
                        aria-label="Sort to the top"
                        title="Sort to the top"
                        style={{
                          width: 28,
                          height: 28,
                          flex: '0 0 auto',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: 15,
                          color: meta?.favorite ? 'var(--zp-accent-300)' : 'var(--zp-text-4)'
                        }}
                      >
                        {meta?.favorite ? '★' : '☆'}
                      </button>
                      <Input
                        style={{ flex: 1, height: 'var(--zp-control-h-sm)' }}
                        value={meta?.name ?? ''}
                        onChange={(e) => renameAccount(accountName, e.target.value)}
                        placeholder="Add a name"
                      />
                      <button
                        className="zp-disclosure"
                        onClick={() => toggleExpanded(accountName)}
                        title="Show characters"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          background: 'none',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          font: 'var(--zp-font-data) 11.5px'
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 120ms cubic-bezier(.2,.7,.3,1)'
                          }}
                        >
                          ›
                        </span>
                        {accountName}
                      </button>
                    </div>
                    {isOpen && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          padding: '2px var(--zp-space-3) 10px 34px'
                        }}
                      >
                        {loadingChars[accountName] ? (
                          <div style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>Loading…</div>
                        ) : (servers?.length ?? 0) === 0 ? (
                          <div style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>
                            No characters found in this account folder.
                          </div>
                        ) : (
                          servers!.map(({ server, characters }) => (
                            <div key={server} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <div
                                style={{
                                  font: '500 10px var(--zp-font-ui)',
                                  textTransform: 'uppercase',
                                  letterSpacing: 'var(--zp-tracking-micro)',
                                  color: 'var(--zp-text-3)'
                                }}
                              >
                                {server}
                              </div>
                              <div style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)', paddingLeft: 10 }}>
                                {characters.join(' · ')}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Field>
      </div>
    </Dialog>
  )
}
