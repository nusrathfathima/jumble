import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route that requires a logged-in parent. This is a client-side
 * convenience only, not the real security boundary — the backend enforces
 * that on every request via JwtAuthFilter/SecurityConfig regardless of
 * what the frontend does. This component just avoids flashing a page that
 * would immediately fail its API calls with 401s.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
