import React, { useEffect, useMemo } from 'react'
import type { DiscoveredAccounts } from '@shared/addonTypes'
import { Panel } from '../surfaces/Panel'
import { SectionHeading } from '../surfaces/SectionHeading'
import { Field } from '../forms/Field'
import { Select } from '../forms/Select'
import type { FileSelection } from '../../state/fileSelection'

interface AccountFilePickerProps {
  title: string
  accounts: DiscoveredAccounts | null
  /** Shared across both sides of the comparison - see AddonPicker. Empty string = not chosen yet. */
  addonId: string
  addonLabel?: string
  accountName: string
  onAccountNameChange: (accountName: string) => void
  value: FileSelection | null
  onChange: (selection: FileSelection | null) => void
}

/** Account picker for the comparison screen: the addon is chosen once, above both sides (see
 * AddonPicker), so this only picks the account - the file is resolved automatically as
 * "this account's file for the shared addon". */
export function AccountFilePicker({
  title,
  accounts,
  addonId,
  addonLabel,
  accountName,
  onAccountNameChange,
  onChange
}: AccountFilePickerProps) {
  const accountFiles = useMemo(() => {
    if (!accounts) return []
    return accounts.accounts.find((a) => a.accountName === accountName)?.files ?? []
  }, [accounts, accountName])

  const resolvedFile = useMemo(
    () => (addonId ? accountFiles.find((f) => f.addonId === addonId) : undefined),
    [accountFiles, addonId]
  )

  useEffect(() => {
    onChange(
      resolvedFile ? { filePath: resolvedFile.filePath, label: resolvedFile.displayName, depth: resolvedFile.depth } : null
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedFile])

  return (
    <Panel style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-4)' }}>
      <SectionHeading title={title} />

      <Field label="Account">
        <Select
          value={accountName}
          onChange={(e) => onAccountNameChange(e.target.value)}
          options={[{ value: '', label: 'Choose an account…' }, ...(accounts?.accounts.map((a) => ({
            value: a.accountName,
            label: `${a.accountName} (${a.flavor})`
          })) ?? [])]}
        />
      </Field>
      {accountName && !addonId ? (
        <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-4)' }}>Choose an addon above.</span>
      ) : accountName && !resolvedFile ? (
        <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-danger-text)' }}>
          No {addonLabel ?? 'matching'} file found for this account.
        </span>
      ) : null}
    </Panel>
  )
}
