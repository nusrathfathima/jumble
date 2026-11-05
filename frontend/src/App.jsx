import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { SideScenery } from './components/Garden'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TopBar } from './components/TopBar'
import { WakeUpNotice } from './components/WakeUpNotice'

// Each page is its own download, fetched only when first visited, so
// the first load (usually the login page) is smaller and faster.
const AppShell = lazy(() => import('./components/AppShell').then((m) => ({ default: m.AppShell })))
const TodayPage = lazy(() => import('./pages/TodayPage').then((m) => ({ default: m.TodayPage })))
const KidsPage = lazy(() => import('./pages/KidsPage').then((m) => ({ default: m.KidsPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })))

function PageLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  )
}

function App() {
  // Lifted up here, since the button that opens Settings lives in TopBar,
  // which sits above the router, not inside any one page.
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      {/* Garden scenery in the side space on wide screens, behind everything. */}
      <SideScenery />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Above the router, so "Jumble" shows the same way on every page. */}
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />
      <WakeUpNotice />
      <Suspense fallback={<PageLoading />}>
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
      </Suspense>
      </Box>
    </>
  )
}

export default App
