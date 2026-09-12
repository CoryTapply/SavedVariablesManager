import React, { useEffect, useState } from 'react'
import { PageShell } from '../components/surfaces/PageShell'
import { SectionHeading } from '../components/surfaces/SectionHeading'
import { Panel } from '../components/surfaces/Panel'
import { Field } from '../components/forms/Field'
import { Button } from '../components/buttons/Button'
import { useComparison } from '../state/ComparisonContext'
import { invoke } from '../lib/ipc'

function PathRow({ path, loading, onChange, chooseLabel }: { path: string | null; loading: boolean; onChange: () => void; chooseLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--zp-space-3)', flexWrap: 'wrap' }}>
      <span
        style={{
          flex: '1 1 auto',
          font: 'var(--zp-text-data)',
          color: path ? 'var(--zp-text-2)' : 'var(--zp-text-4)',
          wordBreak: 'break-all'
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

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { wowRoot, chooseWowRoot } = useComparison()
  const [backupsDir, setBackupsDir] = useState<string | null>(null)
  const [loadingBackupsDir, setLoadingBackupsDir] = useState(true)

  useEffect(() => {
    void (async () => {
      const dir = await invoke('settings:getBackupsDir', undefined)
      setBackupsDir(dir)
      setLoadingBackupsDir(false)
    })()
  }, [])

  const handleChooseBackupsDir = async () => {
    const chosen = await invoke('settings:chooseBackupsDir', undefined)
    if (chosen) setBackupsDir(chosen)
  }

  return (
    <PageShell maxWidth={760}>
      <SectionHeading
        eyebrow="Settings"
        title="App settings"
        description="Configure where this app looks for your WoW install and where it stores backups made before overwriting a file."
        action={
          <Button intent="ghost" onClick={onBack}>
            ← Back
          </Button>
        }
      />

      <Panel style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-6)' }}>
        <Field label="WoW folder" hint="Used to auto-detect your accounts and SavedVariables files.">
          <PathRow path={wowRoot} loading={false} onChange={() => void chooseWowRoot()} chooseLabel="Choose…" />
        </Field>
        <Field label="Backups folder" hint="Account B's file is copied here before a copy overwrites it.">
          <PathRow
            path={backupsDir}
            loading={loadingBackupsDir}
            onChange={() => void handleChooseBackupsDir()}
            chooseLabel="Choose…"
          />
        </Field>
      </Panel>
    </PageShell>
  )
}
