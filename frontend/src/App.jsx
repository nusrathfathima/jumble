import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TopBar } from './components/TopBar'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  return (
    <>
      {/* Rendered above the router, not inside any one route, so "Jumble"
          shows the same way whether you're looking at the login page, the
          signup page, or the signed-in home page. */}
      <TopBar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
