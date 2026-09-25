import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import { saveLocation, clearLocation } from '../api/weather'
import { ApiError } from '../api/client'

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

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700}>
        Weather
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {locationSet
          ? 'Location saved. Outdoor ideas are skipped on rainy days.'
          : 'Share your location so outdoor ideas are skipped on rainy days.'}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant={locationSet ? 'outlined' : 'contained'} size="small" disabled={busy} onClick={handleUseMyLocation}>
          {busy ? 'Working…' : locationSet ? 'Update location' : 'Use my location'}
        </Button>
        {locationSet && (
          <Button variant="text" size="small" color="inherit" disabled={busy} onClick={handleRemove}>
            Remove
          </Button>
        )}
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
