import { apiFetch } from './client'

export function recordCompletion(childId, { activityId, rating, note }) {
  return apiFetch(`/api/children/${childId}/completions`, {
    method: 'POST',
    body: { activityId, rating, note },
  })
}

// Newest first: [{ id, activityId, activityTitle, rating, note, completedAt }]
export function listCompletions(childId) {
  return apiFetch(`/api/children/${childId}/completions`)
}
