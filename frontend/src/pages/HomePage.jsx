import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export function HomePage() {
  const { parent, logout } = useAuth()
  const [backendStatus, setBackendStatus] = useState('checking...')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status))
      .catch(() => setBackendStatus('unreachable'))
  }, [])

  return (
    <div className="app">
      <h1>Jumble</h1>
      <p className="tagline">
        Only suggests things you can actually do right now, with what you
        already have.
      </p>
      <p className="status">
        Backend status: <strong>{backendStatus}</strong>
      </p>
      <p className="status">
        Logged in as <strong>{parent?.displayName || parent?.email}</strong>
      </p>
      <button className="auth-submit" onClick={logout} type="button">
        Log out
      </button>
    </div>
  )
}
