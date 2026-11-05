// A thin wrapper around fetch, shared by every API call the app makes.
//
// What it does that a bare fetch() call would leave every caller to
// repeat:
//   - attaches the saved login token as an Authorization header
//   - turns a non-2xx response into a thrown ApiError with the backend's
//     own message
//   - notices when a request is slow (the free server waking up) so the
//     app can say so instead of looking frozen
//   - notices when the login token has expired and sends the parent back
//     to the login page with a short explanation

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const TOKEN_STORAGE_KEY = 'jumble_token'
const PARENT_STORAGE_KEY = 'jumble_parent'

// A request taking longer than this is almost always the free server
// waking up from a nap.
const SLOW_AFTER_MS = 2500

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

/**
 * Thrown when the backend responds with a non-2xx status. `message` is
 * whatever the backend put in its JSON error body, falling back to the
 * raw status text if the body isn't JSON.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ---- "Is anything slow right now?" ----------------------------------
let slowCount = 0
const slowListeners = new Set()

/** Calls `listener(isSlow)` whenever the app starts or stops waiting on a slow request. */
export function subscribeToSlowRequests(listener) {
  slowListeners.add(listener)
  return () => slowListeners.delete(listener)
}

function changeSlowCount(delta) {
  const wasSlow = slowCount > 0
  slowCount += delta
  const isSlow = slowCount > 0
  if (wasSlow !== isSlow) {
    slowListeners.forEach((listener) => listener(isSlow))
  }
}

/**
 * Fires a no-login health check the moment the app opens, so a sleeping
 * free server starts waking up while the parent is still typing their
 * email, instead of only once they press "Log in".
 */
export function warmUpServer() {
  fetch(`${API_BASE_URL}/api/health`).catch(() => {})
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = auth ? getToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let markedSlow = false
  const slowTimer = setTimeout(() => {
    markedSlow = true
    changeSlowCount(1)
  }, SLOW_AFTER_MS)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Can’t reach Jumble right now. Check your connection and try again.', 0)
  } finally {
    clearTimeout(slowTimer)
    if (markedSlow) changeSlowCount(-1)
  }

  // An expired or invalid login token: the backend refuses every request
  // that needs one. Clear the stale login and go back to the login page,
  // rather than leaving the app quietly empty.
  if (token && (response.status === 401 || response.status === 403)) {
    setToken(null)
    localStorage.removeItem(PARENT_STORAGE_KEY)
    window.location.assign('/login?expired=1')
    throw new ApiError('Your session ended. Please log in again.', response.status)
  }

  // 204 No Content and similar bodies with nothing to parse.
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    // The backend's error shapes: { message: "..." } from most
    // controllers, { fieldName: "message", ... } for validation errors.
    const message =
      data?.message ||
      (data && typeof data === 'object' ? Object.values(data)[0] : null) ||
      response.statusText ||
      'Something went wrong. Please try again.'
    throw new ApiError(message, response.status)
  }

  return data
}
