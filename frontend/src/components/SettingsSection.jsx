import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { HEADING_FONT } from '../theme'

/** One white, rounded section, the same card style the rest of the app uses. */
export function SettingsSection({ title, aside, children }) {
  return (
    <Box
      component="section"
      sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '22px', p: { xs: 2, sm: 2.5 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
        <Typography component="h3" sx={{ fontFamily: HEADING_FONT, fontSize: 19, fontWeight: 800 }}>
          {title}
        </Typography>
        {aside}
      </Box>
      {children}
    </Box>
  )
}
