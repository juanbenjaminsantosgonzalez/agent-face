import { useState } from 'react'
import LogBox from './LogBox'

export default function VerifyPanel({ api }) {
  const [url1, setUrl1]     = useState('')
  const [url2, setUrl2]     = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')

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
        <div className="field">
          <label>IMAGEN REFERENCIA</label>
          <input value={url1} onChange={e => setUrl1(e.target.value)} placeholder="https://…/persona_a.jpg" />
        </div>
        <div className="field">
          <label>IMAGEN A COMPARAR</label>
          <input value={url2} onChange={e => setUrl2(e.target.value)} placeholder="https://…/persona_b.jpg" />
        </div>
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={!url1 || !url2 || api.loading}>
        {api.loading ? 'VERIFICANDO...' : 'VERIFICAR IDENTIDAD →'}
      </button>

      {api.loading && <div className="loading-bar"><div className="loading-fill" /></div>}
      {error && <p style={{ marginTop: 12, fontSize: 12, color: 'var(--red)' }}>✗ {error}</p>}

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
      <div className="tip">Detecta el primer rostro de cada imagen → llama a /face/v1.0/verify en Azure</div>
    </div>
  )
}
