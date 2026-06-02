import { useEffect, useRef } from 'react'

export default function LogBox({ logs }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  if (!logs.length) return null

  return (
    <div ref={ref} style={{
      background: 'var(--bg-0)', border: '1px solid var(--border)',
      padding: '10px 12px', marginTop: 16, maxHeight: 110,
      overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11,
    }}>
      {logs.map((l, i) => (
        <div key={i} style={{ padding: '2px 0', color: 'var(--text-3)' }}>
          <span style={{ marginRight: 8 }}>{l.ts}</span>
          <span style={{ color: l.type === 'ok' ? 'var(--green)' : l.type === 'err' ? 'var(--red)' : 'var(--cyan)' }}>
            {l.type === 'ok' ? '✓' : l.type === 'err' ? '✗' : '›'} {l.msg}
          </span>
        </div>
      ))}
    </div>
  )
}
