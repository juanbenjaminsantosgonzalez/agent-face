import { useState } from 'react'
import { useApi } from './hooks/useApi'
import DetectPanel from './components/DetectPanel'
import VerifyPanel from './components/VerifyPanel'
import AttributesPanel from './components/AttributesPanel'
import './App.css'

const TABS = [
  { id: 'detect', label: 'Face Detection',   short: 'M' },
  { id: 'verify', label: 'Identity Verify',  short: 'V' },
  { id: 'attrs',  label: 'Face Attributes',  short: 'A' },
]

export default function App() {
  const [active, setActive] = useState('detect')
  const api = useApi()

  const panels = {
    detect: <DetectPanel api={api} />,
    verify: <VerifyPanel api={api} />,
    attrs:  <AttributesPanel api={api} />,
  }

  return (
    <>
      <div className="scan-line" />
      <div className="grid-bg" />

      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="6" height="6" stroke="#00d4ff" strokeWidth="1.5" />
                <rect x="13" y="3" width="6" height="6" stroke="#00d4ff" strokeWidth="1.5" />
                <rect x="3" y="13" width="6" height="6" stroke="#00d4ff" strokeWidth="1.5" />
                <rect x="13" y="13" width="6" height="6" stroke="#00d4ff" strokeWidth="1.5" />
                <circle cx="11" cy="11" r="2" fill="#00d4ff" />
              </svg>
            </div>
            <div className="logo-text">
              <h1>FACE AGENT</h1>
              <span>Azure Cognitive Services · FastAPI</span>
            </div>
          </div>
          <div className="status-pill">
            <div className="status-dot" />
            AGENT ONLINE · :8000
          </div>
        </header>

        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab${active === t.id ? ' active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              <span style={{ fontWeight: 700 }}>{t.short}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="panel">
          {panels[active]}
        </div>
      </div>
    </>
  )
}
