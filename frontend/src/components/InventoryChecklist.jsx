import { useEffect, useState } from 'react'
import { listMaterials } from '../api/materials'
import { getInventory, updateInventory } from '../api/inventory'
import { ApiError } from '../api/client'
import './InventoryChecklist.css'

const CATEGORY_LABELS = {
  KITCHEN: 'Kitchen',
  CRAFT: 'Craft supplies',
  RECYCLING: 'Recycling / odds and ends',
  OUTDOOR: 'Outdoor',
  OTHER: 'Other',
}

// Keeps categories in a stable, sensible reading order rather than
// whatever order the database happens to return them in.
const CATEGORY_ORDER = ['KITCHEN', 'CRAFT', 'RECYCLING', 'OUTDOOR', 'OTHER']

export function InventoryChecklist() {
  const [materials, setMaterials] = useState([])
  const [checkedIds, setCheckedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    Promise.all([listMaterials(), getInventory()])
      .then(([materialsData, inventoryIds]) => {
        setMaterials(materialsData)
        setCheckedIds(new Set(inventoryIds))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your inventory.'))
      .finally(() => setLoading(false))
  }, [])

  function toggle(materialId) {
    setJustSaved(false)
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(materialId)) {
        next.delete(materialId)
      } else {
        next.add(materialId)
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateInventory(Array.from(checkedIds))
      setJustSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your inventory.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="inventory-section">
        <h2>What you have on hand</h2>
        <p className="status">Loading…</p>
      </div>
    )
  }

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: materials.filter((m) => m.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="inventory-section">
      <h2>What you have on hand</h2>
      <p className="inventory-hint">
        Suggestions will only include activities you can actually do with what's checked below.
      </p>

      {error && <div className="auth-error">{error}</div>}

      {byCategory.map(({ category, items }) => (
        <div className="inventory-category" key={category}>
          <h3>{CATEGORY_LABELS[category] || category}</h3>
          <div className="inventory-grid">
            {items.map((material) => (
              <label className="inventory-item" key={material.id}>
                <input
                  type="checkbox"
                  checked={checkedIds.has(material.id)}
                  onChange={() => toggle(material.id)}
                />
                {material.displayName}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="inventory-save-row">
        <button className="auth-submit" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save inventory'}
        </button>
        {justSaved && <span className="inventory-saved-note">Saved.</span>}
      </div>
    </div>
  )
}
