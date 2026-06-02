import { useState } from 'react'
import LogBox from './LogBox'

export default function DetectPanel({ api }) {
  const [url, setUrl]       = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')

  const submit = async () => {
    setError(''); setResult(null)
    try {
      const r = await api.call('/face-detection/detect', { imageUrl: url })
      setResult(r)
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div className="section-label">// detección de rostros</div>

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
        {api.loading ? 'PROCESANDO...' : 'DETECTAR ROSTROS →'}
      </button>

      {api.loading && <div className="loading-bar"><div className="loading-fill" /></div>}
      {error && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--red)' }}>✗ {error}</p>}

      {result && (
        <div className="result-box">
          <div className="result-header">
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>RESULTADO</span>
            <span className={`badge ${result.totalFaces > 0 ? 'badge-success' : 'badge-warn'}`}>
              {result.totalFaces} ROSTRO{result.totalFaces !== 1 ? 'S' : ''}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14 }}>{result.message}</p>

          {result.faces.length > 0 && (
            <div className="face-grid">
              {result.faces.map((f, i) => (
                <div className="face-card" key={f.faceId}>
                  <div className="face-id">
                    FACE_{i + 1}<br />
                    <span>{f.faceId.slice(0, 20)}…</span>
                  </div>
                  <div className="rect-grid">
                    {Object.entries(f.faceRectangle).map(([k, v]) => (
                      <div className="rect-item" key={k}>
                        <span className="k">{k}</span>
                        <span className="v">{v}px</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <LogBox logs={api.logs} />
      <div className="tip">POST /face-detection/detect · header: x-api-key</div>
    </div>
  )
}
