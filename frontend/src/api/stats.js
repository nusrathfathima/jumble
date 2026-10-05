import { apiFetch } from './client'

// { totalCompletions, completionsThisMonth, lovedCount, okCount, skippedCount, favoriteTag }
export function getStats(childId) {
  return apiFetch(`/api/children/${childId}/stats`)
}
