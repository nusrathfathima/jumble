import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import { saveLocation, clearLocation } from '../api/weather'
import { ApiError } from '../api/client'
import { LocationIcon } from './Icons'
import { SettingsSection } from './SettingsSection'

/**
 * "Use my location" for weather-aware suggestions, shown in Settings.
 * The browser asks the parent for permission; only the rough position
 * is kept (the backend rounds it to about 1 km before saving).
 */
export function LocationSetting({ locationSet, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function handleUseMyLocation() {
    setError(null)
    if (!navigator.geolocation) {
      setError('This browser can’t share a location.')
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await saveLocation(position.coords.latitude, position.coords.longitude)
          onChanged?.()
        } catch (err) {
          setError(err instanceof ApiError ? err.message : 'Could not save your location. Try again.')
        } finally {
          setBusy(false)
        }
      },
      (geoError) => {
        setBusy(false)
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Location permission was blocked. You can allow it in your browser’s site settings, then try again.'
            : 'Couldn’t find your location right now. Try again in a moment.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 },
    )
  }

  async function handleRemove() {
    setError(null)
    setBusy(true)
    try {
      await clearLocation()
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove your location. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const status = locationSet ? (
    <Box
      component="span"
      sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: '#E3F5EC', color: '#1E6B47', fontSize: 12, fontWeight: 800, flexShrink: 0 }}
    >
      On
    </Box>
  ) : null

  return (
    <SettingsSection title="Weather" aside={status}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <LocationIcon size={20} />
        </Box>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', pt: 0.25 }}>
          {locationSet
            ? 'Your location is saved, rounded to about 1 km. Outdoor ideas are skipped on rainy days.'
            : 'Share your location so outdoor ideas are skipped on rainy days. Only a rough location (about 1 km) is kept.'}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button
          variant={locationSet ? 'outlined' : 'contained'}
          disabled={busy}
          onClick={handleUseMyLocation}
          sx={{ boxShadow: 'none' }}
        >
          {busy ? 'Working…' : locationSet ? 'Update location' : 'Use my location'}
        </Button>
        {locationSet && (
          <Button variant="text" color="inherit" disabled={busy} onClick={handleRemove} sx={{ color: 'text.secondary' }}>
            Remove
          </Button>
        )}
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}
    </SettingsSection>
  )
}
