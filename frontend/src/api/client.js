// A thin wrapper around fetch, shared by every API call the app makes.
//
// Two things it does that a bare fetch() call would otherwise leave every
// caller to repeat: it attaches the saved JWT as an Authorization header
// when one exists, and it turns a non-2xx response into a thrown error
// carrying the backend's own message, instead of silently returning a
// response object callers have to remember to check res.ok on.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const TOKEN_STORAGE_KEY = 'jumble_token'

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
 * whatever the backend put in its JSON error body (e.g. "Invalid email or
 * password", or a field-level validation message), falling back to the
 * raw status text if the body isn't JSON.
 */
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // 204 No Content and similar bodies with nothing to parse.
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    // The backend's error shapes: AuthController sends { message: "..." },
    // GlobalExceptionHandler sends { fieldName: "message", ... } for
    // validation errors. Either way, take the first readable string we
    // can find rather than assuming one exact shape.
    const message =
      data?.message ||
      (data && typeof data === 'object' ? Object.values(data)[0] : null) ||
      response.statusText
    throw new ApiError(message, response.status)
  }

  return data
}
