import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { listMaterials } from '../api/materials'
import { getInventory, updateInventory } from '../api/inventory'
import { ApiError } from '../api/client'
import { colorForTag } from '../theme'

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

// No outer Card here — this now only ever renders inside the Settings
// dialog's "What you have on hand" accordion, which already provides its
// own bordered container, so an inner Card would just be a box in a box.
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: materials.filter((m) => m.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <Box sx={{ textAlign: 'left' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tap what you have — suggestions will only include activities you can actually do with it.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2.5}>
        {byCategory.map(({ category, items }) => {
          // Every item in a category shares one color, so the checklist
          // reads as a handful of colorful groups rather than a plain
          // list — and picking what's on hand becomes tapping chips
          // instead of hunting for tiny checkboxes.
          const categoryColor = colorForTag(category)
          return (
            <Box key={category}>
              <Typography
                variant="overline"
                sx={{ letterSpacing: '0.08em', fontWeight: 700, color: categoryColor }}
              >
                {CATEGORY_LABELS[category] || category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.75 }}>
                {items.map((material) => {
                  const selected = checkedIds.has(material.id)
                  return (
                    <Chip
                      key={material.id}
                      label={material.displayName}
                      clickable
                      onClick={() => toggle(material.id)}
                      variant={selected ? 'filled' : 'outlined'}
                      sx={
                        selected
                          ? { bgcolor: categoryColor, color: '#FFFFFF', fontWeight: 600, borderColor: categoryColor }
                          : { borderColor: categoryColor, color: categoryColor, fontWeight: 600 }
                      }
                    />
                  )
                })}
              </Box>
            </Box>
          )
        })}
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save inventory'}
        </Button>
        {justSaved && (
          <Typography variant="body2" color="secondary.main" fontWeight={600}>
            Saved.
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
