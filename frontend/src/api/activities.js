import { apiFetch } from './client'

// One activity's full detail: summary, mess level, location, what it
// needs, and its ordered steps.
export function getActivity(activityId) {
  return apiFetch(`/api/activities/${activityId}`)
}
