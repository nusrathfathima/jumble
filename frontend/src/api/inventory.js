import { apiFetch } from './client'

export function getInventory() {
  return apiFetch('/api/inventory')
}

// Sends the FULL current set of material ids the parent has checked — the
// backend replaces its stored inventory wholesale with exactly this list
// rather than diffing adds/removes. See InventoryController's comment.
export function updateInventory(materialIds) {
  return apiFetch('/api/inventory', {
    method: 'PUT',
    body: { materialIds },
  })
}
