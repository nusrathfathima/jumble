import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TopBar } from './components/TopBar'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  // Lifted up here rather than owned by HomePage, since the button that
  // opens Settings lives in TopBar — a sibling of the router, not a
  // descendant of HomePage — so the two need a shared place to meet.
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      {/* Rendered above the router, not inside any one route, so "Jumble"
          shows the same way whether you're looking at the login page, the
          signup page, or the signed-in home page. */}
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage settingsOpen={settingsOpen} onCloseSettings={() => setSettingsOpen(false)} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
