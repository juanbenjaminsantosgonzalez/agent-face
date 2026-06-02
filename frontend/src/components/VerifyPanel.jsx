import { useState } from 'react'
import LogBox from './LogBox'

export default function VerifyPanel({ api }) {
  const [url1, setUrl1]             = useState('')
  const [url2, setUrl2]             = useState('')
  const [fileSelected1, setFileSelected1] = useState(false)
  const [fileName1, setFileName1]     = useState('')
  const [fileSelected2, setFileSelected2] = useState(false)
  const [fileName2, setFileName2]     = useState('')

  const [imagePreview1, setImagePreview1] = useState('')
  const [imagePreview2, setImagePreview2] = useState('')

  const [naturalSize1, setNaturalSize1]   = useState({ w: 1, h: 1 })
  const [naturalSize2, setNaturalSize2]   = useState({ w: 1, h: 1 })

  const [result, setResult]       = useState(null)
  const [error, setError]         = useState('')

  const handleFileChange1 = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName1(file.name)
    setFileSelected1(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setUrl1(reader.result)
      setImagePreview1(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange2 = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName2(file.name)
    setFileSelected2(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setUrl2(reader.result)
      setImagePreview2(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const clearSelection1 = () => {
    setUrl1('')
    setFileName1('')
    setFileSelected1(false)
    setImagePreview1('')
    setResult(null)
    setError('')
  }

  const clearSelection2 = () => {
    setUrl2('')
    setFileName2('')
    setFileSelected2(false)
    setImagePreview2('')
    setResult(null)
    setError('')
  }

  const handleUrlChange1 = (val) => {
    setUrl1(val)
    setImagePreview1(val)
    setFileSelected1(false)
    setFileName1('')
  }

  const handleUrlChange2 = (val) => {
    setUrl2(val)
    setImagePreview2(val)
    setFileSelected2(false)
    setFileName2('')
  }

  const submit = async () => {
    setError(''); setResult(null)
    try {
      const r = await api.call('/identity-verification/verify', {
        imageUrl1: url1, imageUrl2: url2,
      })
      setResult(r)
    } catch (e) { setError(e.message) }
  }

  const pct   = result ? result.confidencePercent : 0
  const color = result
    ? result.isIdentical ? 'var(--green)' : pct > 40 ? 'var(--amber)' : 'var(--red)'
    : undefined

  return (
    <div>
      <div className="section-label">// verificación de identidad 1:1</div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        {/* REFERENCIA */}
        <div className="field">
          <label>IMAGEN REFERENCIA</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={fileSelected1 ? `Archivo: ${fileName1}` : url1}
              onChange={e => handleUrlChange1(e.target.value)}
              disabled={fileSelected1}
              placeholder="https://…/persona_a.jpg o sube imagen"
              style={{ flex: 1 }}
            />
            {fileSelected1 ? (
              <button className="btn" style={{ background: 'var(--red)', color: '#fff', padding: '10px' }} onClick={clearSelection1}>
                ✕
              </button>
            ) : (
              <label className="btn" style={{ background: 'var(--bg-3)', color: 'var(--text-1)', padding: '10px', cursor: 'pointer', border: '1px solid var(--border)', fontSize: '11px' }}>
                Subir
                <input type="file" accept="image/*" onChange={handleFileChange1} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* COMPARAR */}
        <div className="field">
          <label>IMAGEN A COMPARAR</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={fileSelected2 ? `Archivo: ${fileName2}` : url2}
              onChange={e => handleUrlChange2(e.target.value)}
              disabled={fileSelected2}
              placeholder="https://…/persona_b.jpg o sube imagen"
              style={{ flex: 1 }}
            />
            {fileSelected2 ? (
              <button className="btn" style={{ background: 'var(--red)', color: '#fff', padding: '10px' }} onClick={clearSelection2}>
                ✕
              </button>
            ) : (
              <label className="btn" style={{ background: 'var(--bg-3)', color: 'var(--text-1)', padding: '10px', cursor: 'pointer', border: '1px solid var(--border)', fontSize: '11px' }}>
                Subir
                <input type="file" accept="image/*" onChange={handleFileChange2} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={!url1 || !url2 || api.loading}>
        {api.loading ? 'VERIFICANDO...' : 'VERIFICAR IDENTIDAD →'}
      </button>

      {api.loading && <div className="loading-bar"><div className="loading-fill" /></div>}
      {error && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--red)' }}>✗ {error}</p>}

      {/* Previsualización de Imágenes y Cajas Delimitadoras */}
      {(imagePreview1 || imagePreview2) && (
        <div className="two-col" style={{ marginTop: 20, marginBottom: 20 }}>
          {imagePreview1 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.1em' }}>IMAGEN 1 (REFERENCIA)</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview1}
                  alt="Referencia"
                  style={{ maxWidth: '100%', maxHeight: '220px', display: 'block', border: '1px solid var(--border)' }}
                  onLoad={(e) => setNaturalSize1({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 })}
                />
                {result && result.faceRectangle1 && (
                  <div style={{
                    position: 'absolute',
                    left: `${(result.faceRectangle1.left / naturalSize1.w) * 100}%`,
                    top: `${(result.faceRectangle1.top / naturalSize1.h) * 100}%`,
                    width: `${(result.faceRectangle1.width / naturalSize1.w) * 100}%`,
                    height: `${(result.faceRectangle1.height / naturalSize1.h) * 100}%`,
                    border: '2px solid var(--cyan)',
                    boxShadow: '0 0 6px var(--cyan-glow)',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            </div>
          )}
          {imagePreview2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.1em' }}>IMAGEN 2 (COMPARACIÓN)</div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview2}
                  alt="Comparación"
                  style={{ maxWidth: '100%', maxHeight: '220px', display: 'block', border: '1px solid var(--border)' }}
                  onLoad={(e) => setNaturalSize2({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 })}
                />
                {result && result.faceRectangle2 && (
                  <div style={{
                    position: 'absolute',
                    left: `${(result.faceRectangle2.left / naturalSize2.w) * 100}%`,
                    top: `${(result.faceRectangle2.top / naturalSize2.h) * 100}%`,
                    width: `${(result.faceRectangle2.width / naturalSize2.w) * 100}%`,
                    height: `${(result.faceRectangle2.height / naturalSize2.h) * 100}%`,
                    border: '2px solid var(--cyan)',
                    boxShadow: '0 0 6px var(--cyan-glow)',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="result-box">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 800, color, lineHeight: 1 }}>
              {pct}<span style={{ fontSize: 28 }}>%</span>
            </div>
            <div style={{ fontSize: 13, letterSpacing: '0.2em', color, marginTop: 8 }}>
              {result.isIdentical ? '✓ IDENTIDAD CONFIRMADA' : '✗ PERSONAS DISTINTAS'}
            </div>

            <div style={{ height: 6, background: 'var(--bg-3)', margin: '16px auto', maxWidth: 260, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 1s ease' }} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>{result.verdict}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>MATCH</div>
                <span className={`badge ${result.isIdentical ? 'badge-success' : 'badge-error'}`}>
                  {result.isIdentical ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>CONFIDENCE</div>
                <span className="badge badge-info">{result.confidence.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <LogBox logs={api.logs} />
      <div className="tip">Detecta el primer rostro de cada imagen → compara faceIds con Azure Face API o simulación local</div>
    </div>
  )
}
