import { useState } from 'react'
import LogBox from './LogBox'

export default function AttributesPanel({ api }) {
  const [url, setUrl]       = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')

  const submit = async () => {
    setError(''); setResult(null)
    try {
      const r = await api.call('/face-attributes/analyze', { imageUrl: url })
      setResult(r)
    } catch (e) { setError(e.message) }
  }

  const a = result?.attributes

  return (
    <div>
      <div className="section-label">// análisis de atributos faciales</div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>IMAGE URL</label>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && url && submit()}
          placeholder="https://example.com/foto.jpg"
        />
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={!url || api.loading}>
        {api.loading ? 'ANALIZANDO...' : 'ANALIZAR ATRIBUTOS →'}
      </button>

      {api.loading && <div className="loading-bar"><div className="loading-fill" /></div>}
      {error && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--red)' }}>✗ {error}</p>}

      {result && a && (
        <div className="result-box">
          <div className="result-header">
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>ATRIBUTOS</span>
            <span className="badge badge-info">FACE API v1.0</span>
          </div>

          <div className="attr-grid">
            {a.age != null && (
              <div className="attr-card">
                <div className="attr-val">{Math.round(a.age)}</div>
                <div className="attr-key">edad estimada</div>
              </div>
            )}
            {a.gender && (
              <div className="attr-card">
                <div className="attr-val" style={{ fontSize: 20 }}>
                  {a.gender === 'male' ? '♂ male' : '♀ female'}
                </div>
                <div className="attr-key">género</div>
              </div>
            )}
            {a.smile != null && (
              <div className="attr-card">
                <div className="attr-val">{Math.round(a.smile * 100)}%</div>
                <div className="attr-key">sonrisa</div>
              </div>
            )}
            {a.glasses && (
              <div className="attr-card">
                <div className="attr-val" style={{ fontSize: 13, lineHeight: 1.3 }}>{a.glasses}</div>
                <div className="attr-key">gafas</div>
              </div>
            )}
            {a.blur?.blurLevel && (
              <div className="attr-card">
                <div className="attr-val" style={{ fontSize: 16 }}>{a.blur.blurLevel}</div>
                <div className="attr-key">desenfoque</div>
              </div>
            )}
          </div>

          {a.headPose && (
            <div style={{ marginTop: 16 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>pose de cabeza</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {Object.entries(a.headPose).map(([k, v]) => (
                  <div className="attr-card" key={k} style={{ flex: 1, textAlign: 'center' }}>
                    <div className="attr-val" style={{ fontSize: 22 }}>{Math.round(v)}°</div>
                    <div className="attr-key">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {a.emotion && (
            <div style={{ marginTop: 16 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>emociones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(a.emotion)
                  .sort(([, a], [, b]) => b - a)
                  .map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <span style={{ width: 82, color: 'var(--text-2)', textTransform: 'capitalize' }}>{k}</span>
                      <div style={{ flex: 1, height: 4, background: 'var(--bg-3)' }}>
                        <div style={{ height: '100%', width: `${Math.round(v * 100)}%`, background: 'var(--cyan)', transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ width: 36, textAlign: 'right', color: 'var(--text-1)' }}>
                        {Math.round(v * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <LogBox logs={api.logs} />
      <div className="tip">Usa detectionModel: detection_01 · atributos: age, gender, smile, glasses, emotion, headPose, blur</div>
    </div>
  )
}
