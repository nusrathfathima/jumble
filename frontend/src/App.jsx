import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TopBar } from './components/TopBar'
import { AppShell } from './components/AppShell'
import { TodayPage } from './pages/TodayPage'
import { KidsPage } from './pages/KidsPage'
import { HistoryPage } from './pages/HistoryPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  // Lifted up here, since the button that opens Settings lives in TopBar,
  // which sits above the router, not inside any one page.
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      {/* Above the router, so "Jumble" shows the same way on every page. */}
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell
                settingsOpen={settingsOpen}
                onOpenSettings={() => setSettingsOpen(true)}
                onCloseSettings={() => setSettingsOpen(false)}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<TodayPage />} />
          <Route path="kids" element={<KidsPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
