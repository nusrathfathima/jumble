import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { listMaterials } from '../api/materials'
import { getInventory, updateInventory } from '../api/inventory'
import { ApiError } from '../api/client'
import { softColorFor } from '../theme'
import { SettingsSection } from './SettingsSection'

const CATEGORY_LABELS = {
  KITCHEN: 'Kitchen',
  CRAFT: 'Craft supplies',
  RECYCLING: 'Recycling and odds and ends',
  OUTDOOR: 'Outdoor',
  OTHER: 'Other',
}

// A stable reading order rather than whatever order the database returns.
const CATEGORY_ORDER = ['KITCHEN', 'CRAFT', 'RECYCLING', 'OUTDOOR', 'OTHER']

/**
 * "What you have on hand": plain checkboxes, grouped by category. Each
 * category's checkboxes take one colour from the same soft palette as
 * the child avatars, so the list has a little colour without being loud.
 */
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
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your supplies.'))
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
      setError(err instanceof ApiError ? err.message : 'Could not save your supplies.')
    } finally {
      setSaving(false)
    }
  }

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: materials.filter((m) => m.category === category),
  })).filter((group) => group.items.length > 0)

  const count = (
    <Box
      component="span"
      sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 12, fontWeight: 800, flexShrink: 0 }}
    >
      {checkedIds.size} selected
    </Box>
  )

  return (
    <SettingsSection title="What you have on hand" aside={loading ? null : count}>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
        Tick what you have at home. Ideas will only use things you actually have.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={26} />
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {byCategory.map(({ category, items }) => {
              const { fg } = softColorFor(category)
              return (
                <Box key={category}>
                  <Typography component="h4" sx={{ fontSize: 13, fontWeight: 800, color: 'text.secondary', mb: 0.25 }}>
                    {CATEGORY_LABELS[category] || category}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    {items.map((material) => (
                      <FormControlLabel
                        key={material.id}
                        sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: 15 } }}
                        control={
                          <Checkbox
                            checked={checkedIds.has(material.id)}
                            onChange={() => toggle(material.id)}
                            sx={{ color: '#A9BCCB', '&.Mui-checked': { color: fg } }}
                          />
                        }
                        label={material.displayName}
                      />
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2.5 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ boxShadow: 'none' }}>
              {saving ? 'Saving…' : 'Save supplies'}
            </Button>
            {justSaved && <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'success.dark' }}>Saved.</Typography>}
          </Box>
        </>
      )}
    </SettingsSection>
  )
}
