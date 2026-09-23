import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listChildren } from '../api/children'
import { listTags } from '../api/tags'
import { ChildList } from '../components/ChildList'
import { AddChildForm } from '../components/AddChildForm'
import { InventoryChecklist } from '../components/InventoryChecklist'
import { SuggestionsPanel } from '../components/SuggestionsPanel'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export function HomePage() {
  const { parent, logout } = useAuth()
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [children, setChildren] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status))
      .catch(() => setBackendStatus('unreachable'))
  }, [])

  useEffect(() => {
    Promise.all([listChildren(), listTags()])
      .then(([childrenData, tagsData]) => {
        setChildren(childrenData)
        setTags(tagsData)
      })
      // A failure here (expired token, backend down) is left silent in the
      // UI beyond staying in the loading/empty state — good enough for
      // this stage; a proper error banner can come once there's more than
      // one screen relying on this pattern.
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleChildAdded(child) {
    setChildren((prev) => [...prev, child])
  }

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

      <div className="children-section">
        <h2>Your children</h2>
        {loading ? (
          <p className="status">Loading…</p>
        ) : (
          <>
            <ChildList childList={children} tags={tags} />
            <AddChildForm tags={tags} onChildAdded={handleChildAdded} />
          </>
        )}
      </div>

      <InventoryChecklist />

      {!loading && <SuggestionsPanel childList={children} />}
    </div>
  )
}
