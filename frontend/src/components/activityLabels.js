// Plain-language labels for the activity fields the backend sends as codes.

export const MESS_LABELS = { 1: 'Low mess', 2: 'Some mess', 3: 'Messy' }

export const LOCATION_LABELS = { INDOOR: 'Indoor', OUTDOOR: 'Outdoor', EITHER: 'Indoor or outdoor' }

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}
