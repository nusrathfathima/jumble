import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { HEADING_FONT, SKY } from '../theme'
import { LocationIcon } from './Icons'
import { WeatherScene } from './Garden'

/**
 * Today's weather as a little picture card: a rain cloud over the hills
 * on wet days, a smiling sun otherwise. With no location saved yet it is
 * a gentle nudge that opens Settings instead. Open-Meteo's free tier
 * requires a credit line (CC BY), so the small link under it stays.
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
          px: 1.75,
          py: 1,
          borderRadius: 999,
          border: '1.5px dashed',
          borderColor: '#93AE9B',
          bgcolor: 'background.paper',
          color: 'primary.dark',
          fontSize: 13,
          fontWeight: 800,
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
    <Box>
      <Box sx={{ minHeight: 88, display: 'flex', alignItems: 'stretch', borderRadius: '22px', bgcolor: SKY.bg, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <WeatherScene wet={wet} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.25, py: 1.25, pr: 1.5 }}>
          <Typography sx={{ fontFamily: HEADING_FONT, fontSize: 18, fontWeight: 800, color: SKY.fg, lineHeight: 1.2 }}>
            {wet ? `Rainy day${temp}` : `${weather.condition}${temp}`}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#2F5F8A' }}>
            {wet ? 'Perfect for indoor fun, so those come first.' : 'Inside or out, it is your pick today.'}
          </Typography>
        </Box>
      </Box>
      <Link
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{ display: 'inline-block', mt: 0.5, pl: 1.5, fontSize: 11, color: 'text.secondary' }}
      >
        Weather data by Open-Meteo.com
      </Link>
    </Box>
  )
}
