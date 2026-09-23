import { apiFetch } from './client'

export function getSuggestions(childId, { availableMinutes, maxMessLevel, locationType }) {
  const params = new URLSearchParams({
    availableMinutes: String(availableMinutes),
    maxMessLevel: String(maxMessLevel),
    locationType,
  })
  return apiFetch(`/api/children/${childId}/suggestions?${params.toString()}`)
}
