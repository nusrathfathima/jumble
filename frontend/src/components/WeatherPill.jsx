import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { CloudIcon, CloudRainIcon, LocationIcon } from './Icons'

/**
 * Today's weather in one small pill above the form. When no location is
 * saved yet it becomes a gentle nudge that opens Settings. Open-Meteo's
 * free tier requires a credit line (CC BY), so the small link under it
 * is required, not decoration.
 */
export function WeatherPill({ weather, onSetLocation }) {
  if (!weather) {
    return null
  }

  if (!weather.locationSet) {
    return (
      <ButtonBase
        onClick={onSetLocation}
        sx={{
          alignSelf: 'flex-start',
          gap: 1,
          px: 1.5,
          py: 0.875,
          borderRadius: 999,
          border: '1.5px dashed',
          borderColor: '#A9BCCB',
          color: 'text.secondary',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <LocationIcon size={18} />
        Add your location for rainy-day smarts
      </ButtonBase>
    )
  }

  if (!weather.available) {
    return null
  }

  const wet = weather.outdoorFriendly === false
  const temp = weather.tempC != null ? `, ${Math.round(weather.tempC)}°C` : ''

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.875,
          borderRadius: 999,
          bgcolor: 'primary.light',
          color: 'primary.dark',
        }}
      >
        {wet ? <CloudRainIcon size={18} /> : <CloudIcon size={18} />}
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 700 }}>
          {weather.condition}
          {temp}
          {wet ? ' · indoor ideas first' : ''}
        </Typography>
      </Box>
      <Link
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{ fontSize: 11, color: 'text.secondary', pl: 1.5 }}
      >
        Weather data by Open-Meteo.com
      </Link>
    </Box>
  )
}
