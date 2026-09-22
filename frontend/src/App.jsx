import { useEffect, useState } from 'react'
import './App.css'

// The backend's URL. During local development this points at Spring Boot
// running on your machine; in production it will point at the deployed
// Render URL. See the .env.example file for how to configure this.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function App() {
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
    </div>
  )
}

export default App
