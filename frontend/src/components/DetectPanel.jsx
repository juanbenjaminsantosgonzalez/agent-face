import { useState } from 'react'
import LogBox from './LogBox'

export default function DetectPanel({ api }) {
  const [url, setUrl]             = useState('')
  const [fileSelected, setFileSelected] = useState(false)
  const [fileName, setFileName]     = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [naturalSize, setNaturalSize]   = useState({ w: 1, h: 1 })
  const [hoveredFaceId, setHoveredFaceId] = useState(null)
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
      const r = await api.call('/face-detection/detect', { imageUrl: url })
      setResult(r)
    } catch (e) { setError(e.message) }
  }

  const handleImageLoad = (e) => {
    setNaturalSize({
      w: e.target.naturalWidth || 1,
      h: e.target.naturalHeight || 1
    })
  }

  const renderBoundingBoxes = () => {
    if (!result || !result.faces) return null
    return result.faces.map((f, i) => {
      const box = f.faceRectangle
      const left = (box.left / naturalSize.w) * 100
      const top = (box.top / naturalSize.h) * 100
      const width = (box.width / naturalSize.w) * 100
      const height = (box.height / naturalSize.h) * 100
      
      const isHovered = hoveredFaceId === f.faceId
      
      return (
        <div
          key={f.faceId}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            border: isHovered ? '3px solid var(--green)' : '2px solid var(--cyan)',
            boxShadow: isHovered ? '0 0 12px var(--green)' : '0 0 6px var(--cyan-glow)',
            transition: 'all 0.15s ease',
            zIndex: 10,
            cursor: 'pointer'
          }}
          onMouseEnter={() => setHoveredFaceId(f.faceId)}
          onMouseLeave={() => setHoveredFaceId(null)}
        >
          <div style={{
            position: 'absolute',
            top: -18,
            left: -2,
            background: isHovered ? 'var(--green)' : 'var(--cyan)',
            color: '#000',
            fontSize: '9px',
            fontWeight: 800,
            padding: '2px 5px',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
            lineHeight: 1
          }}>
            FACE_{i + 1}
          </div>
        </div>
      )
    })
  }

  return (
    <div>
      <div className="section-label">// detección de rostros</div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>IMAGEN A DETECTAR</label>
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
        {api.loading ? 'PROCESANDO...' : 'DETECTAR ROSTROS →'}
      </button>

      {api.loading && <div className="loading-bar"><div className="loading-fill" /></div>}
      {error && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--red)' }}>✗ {error}</p>}

      {/* Image Preview and Bounding Boxes */}
      {imagePreview && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '350px', display: 'block', border: '1px solid var(--border)' }}
              onLoad={handleImageLoad}
            />
            {renderBoundingBoxes()}
          </div>
        </div>
      )}

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
                <div
                  className="face-card"
                  key={f.faceId}
                  style={{
                    borderColor: hoveredFaceId === f.faceId ? 'var(--green)' : 'var(--border)',
                    boxShadow: hoveredFaceId === f.faceId ? '0 0 10px rgba(0, 255, 136, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={() => setHoveredFaceId(f.faceId)}
                  onMouseLeave={() => setHoveredFaceId(null)}
                >
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
      <div className="tip">POST /face-detection/detect · soporta URLs y archivos locales en base64</div>
    </div>
  )
}
