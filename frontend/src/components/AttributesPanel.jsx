import { useState } from 'react'
import LogBox from './LogBox'

export default function AttributesPanel({ api }) {
  const [url, setUrl]             = useState('')
  const [fileSelected, setFileSelected] = useState(false)
  const [fileName, setFileName]     = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [naturalSize, setNaturalSize]   = useState({ w: 1, h: 1 })
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setFileSelected(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setUrl(reader.result)
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const clearSelection = () => {
    setUrl('')
    setFileName('')
    setFileSelected(false)
    setImagePreview('')
    setResult(null)
    setError('')
  }

  const handleUrlChange = (val) => {
    setUrl(val)
    setImagePreview(val)
    setFileSelected(false)
    setFileName('')
  }

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
        <label>IMAGEN A ANALIZAR</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={fileSelected ? `Archivo: ${fileName}` : url}
            onChange={e => handleUrlChange(e.target.value)}
            disabled={fileSelected}
            onKeyDown={e => e.key === 'Enter' && url && submit()}
            placeholder="https://example.com/foto.jpg o sube una imagen local"
            style={{ flex: 1 }}
          />
          {fileSelected ? (
            <button className="btn" style={{ background: 'var(--red)', color: '#fff', padding: '10px 15px' }} onClick={clearSelection}>
              ✕
            </button>
          ) : (
            <label className="btn" style={{ background: 'var(--bg-3)', color: 'var(--text-1)', padding: '10px 15px', cursor: 'pointer', border: '1px solid var(--border)' }}>
              Subir
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={!url || api.loading}>
        {api.loading ? 'ANALIZANDO...' : 'ANALIZAR ATRIBUTOS →'}
      </button>

      {api.loading && <div className="loading-bar"><div className="loading-fill" /></div>}
      {error && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--red)' }}>✗ {error}</p>}

      {/* Image Preview and Bounding Box */}
      {imagePreview && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, marginBottom: 20 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', border: '1px solid var(--border)' }}
              onLoad={(e) => setNaturalSize({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 })}
            />
            {result && result.faceRectangle && (
              <div style={{
                position: 'absolute',
                left: `${(result.faceRectangle.left / naturalSize.w) * 100}%`,
                top: `${(result.faceRectangle.top / naturalSize.h) * 100}%`,
                width: `${(result.faceRectangle.width / naturalSize.w) * 100}%`,
                height: `${(result.faceRectangle.height / naturalSize.h) * 100}%`,
                border: '2px solid var(--cyan)',
                boxShadow: '0 0 6px var(--cyan-glow)',
                pointerEvents: 'none'
              }} />
            )}
          </div>
        </div>
      )}

      {result && a && (
        <div className="result-box">
          <div className="result-header">
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>ATRIBUTOS DETECTADOS</span>
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
      <div className="tip">Analiza el primer rostro detectado con Azure Face API o simulación local</div>
    </div>
  )
}
