import { apiFetch } from './client'

// Activity details never change while the app is open, so each one is
// fetched once and remembered. The top-pick card and the "Let's start"
// steps share the same request, so opening the steps is instant.
const cache = new Map()

export function getActivity(activityId) {
  if (!cache.has(activityId)) {
    const request = apiFetch(`/api/activities/${activityId}`).catch((err) => {
      // Don't remember failures; let the next attempt try again.
      cache.delete(activityId)
      throw err
    })
    cache.set(activityId, request)
  }
  return cache.get(activityId)
}
