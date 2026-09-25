import { apiFetch } from './client'

// { locationSet, available, condition, tempC, precipitationChance, outdoorFriendly }
export function getTodayWeather() {
  return apiFetch('/api/weather/today')
}

export function saveLocation(latitude, longitude) {
  return apiFetch('/api/me/location', { method: 'PUT', body: { latitude, longitude } })
}

export function clearLocation() {
  return apiFetch('/api/me/location', { method: 'DELETE' })
}
