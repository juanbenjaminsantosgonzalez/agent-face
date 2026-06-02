import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const API_KEY  = import.meta.env.VITE_API_KEY  || ''

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs]       = useState([])

  const addLog = useCallback((type, msg) => {
    setLogs(prev => [...prev, { type, msg, ts: ts() }].slice(-40))
  }, [])

  const call = useCallback(async (endpoint, body) => {
    setLoading(true)
    addLog('info', `POST ${endpoint}`)
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data?.detail || data?.message || 'Error del servidor'
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      }
      addLog('ok', `${res.status} OK`)
      return data
    } catch (e) {
      addLog('err', e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [addLog])

  return { loading, logs, call, addLog }
}
