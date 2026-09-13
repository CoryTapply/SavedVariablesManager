import React from 'react'
import { ComparisonProvider, useComparison } from './state/ComparisonContext'
import { CompareScreen } from './routes/CompareScreen'
import { SettingsDialog } from './components/app/SettingsDialog'

function AppContent() {
  const { settingsOpen, closeSettings } = useComparison()
  return (
    <>
      <CompareScreen />
      {settingsOpen ? <SettingsDialog onClose={closeSettings} /> : null}
    </>
  )
}

const dragRegionStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 32,
  zIndex: 1000,
  WebkitAppRegion: 'drag'
} as React.CSSProperties

export function App() {
  return (
    <div style={{ height: '100%' }}>
      <ComparisonProvider>
        <div style={dragRegionStyle} />
        <AppContent />
      </ComparisonProvider>
    </div>
  )
}
