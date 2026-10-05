import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

/** One white, rounded section, the same card style the rest of the app uses. */
export function SettingsSection({ title, aside, children }) {
  return (
    <Box
      component="section"
      sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px', p: { xs: 2, sm: 2.5 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
        <Typography component="h3" sx={{ fontSize: 17, fontWeight: 800 }}>
          {title}
        </Typography>
        {aside}
      </Box>
      {children}
    </Box>
  )
}
