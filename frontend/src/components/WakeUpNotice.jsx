import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { subscribeToSlowRequests } from '../api/client'
import { Sprout } from './Garden'

/**
 * A friendly note that appears only while a request is unusually slow,
 * which on the free hosting plan means the server is waking up from a
 * nap. It disappears by itself as soon as the request finishes.
 */
export function WakeUpNotice() {
  const [slow, setSlow] = useState(false)

  useEffect(() => subscribeToSlowRequests(setSlow), [])

  if (!slow) return null

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: 'fixed',
        left: '50%',
        bottom: { xs: 92, sm: 24 },
        transform: 'translateX(-50%)',
        zIndex: 1400,
        width: 'calc(100% - 32px)',
        maxWidth: 440,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: '20px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 10px 30px rgba(22, 48, 31, 0.18)',
      }}
    >
      <Sprout size={44} />
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 15 }}>Waking up Jumble…</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          It naps when nobody&rsquo;s around. The first visit can take up to a minute.
        </Typography>
      </Box>
    </Box>
  )
}
