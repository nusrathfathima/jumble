import { createContext, useContext, useState, useCallback } from 'react'
import { getToken, setToken as saveToken } from '../api/client'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

const PARENT_STORAGE_KEY = 'jumble_parent'

function readStoredParent() {
  const raw = localStorage.getItem(PARENT_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Holds the signed-in parent's identity for the whole app. A parent is
 * "logged in" from the app's point of view whenever a token exists — this
 * provider doesn't re-verify the token itself; the backend does that on
 * every request via JwtAuthFilter, and an expired/invalid token just
 * starts producing 401s, which callers handle by logging out (see
 * ProtectedRoute).
 */
export function AuthProvider({ children }) {
  const [parent, setParent] = useState(readStoredParent)

  const persistSession = useCallback((authResponse) => {
    const { token, ...parentInfo } = authResponse
    saveToken(token)
    localStorage.setItem(PARENT_STORAGE_KEY, JSON.stringify(parentInfo))
    setParent(parentInfo)
  }, [])

  const signup = useCallback(
    async (form) => {
      const response = await authApi.signup(form)
      persistSession(response)
      return response
    },
    [persistSession],
  )

  const login = useCallback(
    async (form) => {
      const response = await authApi.login(form)
      persistSession(response)
      return response
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    saveToken(null)
    localStorage.removeItem(PARENT_STORAGE_KEY)
    setParent(null)
  }, [])

  const value = {
    parent,
    isAuthenticated: Boolean(parent && getToken()),
    signup,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
