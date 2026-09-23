import { apiFetch } from './client'

// Neither call attaches a token (auth: false) — that's the whole point of
// these two endpoints: they're how you get a token in the first place.
export function signup({ email, password, displayName }) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: { email, password, displayName },
    auth: false,
  })
}

export function login({ email, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}
