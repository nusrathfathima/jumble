import { apiFetch } from './client'

// Every call here relies on apiFetch's default (auth: true) to attach the
// JWT — the backend derives which parent's children these are from that
// token, so there's never a parentId to pass in ourselves.
export function listChildren() {
  return apiFetch('/api/children')
}

export function createChild({ name, birthYear, birthMonth, interestTagSlugs }) {
  return apiFetch('/api/children', {
    method: 'POST',
    body: { name, birthYear, birthMonth, interestTagSlugs },
  })
}
