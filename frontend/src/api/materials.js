import { apiFetch } from './client'

export function listMaterials() {
  return apiFetch('/api/materials')
}
