import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { listMaterials } from '../api/materials'
import { getInventory, updateInventory } from '../api/inventory'
import { ApiError } from '../api/client'

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
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            What you have on hand
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    items: materials.filter((m) => m.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <Card>
      <CardContent sx={{ p: 3, textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom>
          What you have on hand
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Suggestions will only include activities you can actually do with what&rsquo;s checked below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {byCategory.map(({ category, items }) => (
            <Box key={category}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.08em', fontWeight: 700 }}
              >
                {CATEGORY_LABELS[category] || category}
              </Typography>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                {items.map((material) => (
                  <FormControlLabel
                    key={material.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={checkedIds.has(material.id)}
                        onChange={() => toggle(material.id)}
                      />
                    }
                    label={material.displayName}
                  />
                ))}
              </FormGroup>
            </Box>
          ))}
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
      </CardContent>
    </Card>
  )
}
