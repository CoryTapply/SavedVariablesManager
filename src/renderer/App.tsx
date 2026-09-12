import React, { useState } from 'react'
import { ComparisonProvider, useComparison } from './state/ComparisonContext'
import { SelectFilesScreen } from './routes/SelectFilesScreen'
import { ComparisonResultsScreen } from './routes/ComparisonResultsScreen'
import { SettingsScreen } from './routes/SettingsScreen'

function AppContent() {
  const { comparisonResult, clearComparison } = useComparison()
  const [showSettings, setShowSettings] = useState(false)

  if (showSettings) {
    return (
      <div className="zp-screen-enter">
        <SettingsScreen onBack={() => setShowSettings(false)} />
      </div>
    )
  }

  if (comparisonResult) {
    return (
      <div className="zp-screen-enter">
        <ComparisonResultsScreen result={comparisonResult} onBack={clearComparison} />
      </div>
    )
  }
  return (
    <div className="zp-screen-enter">
      <SelectFilesScreen onOpenSettings={() => setShowSettings(true)} />
    </div>
  )
}

const dragRegionStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 28,
  zIndex: 1000,
  WebkitAppRegion: 'drag'
} as React.CSSProperties

export function App() {
  return (
    <ComparisonProvider>
      <div style={dragRegionStyle} />
      <AppContent />
    </ComparisonProvider>
  )
}
