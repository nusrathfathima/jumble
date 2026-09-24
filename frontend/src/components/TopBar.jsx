import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { useAuth } from '../context/AuthContext'

/**
 * Shown on every screen — login, signup, and the logged-in home page —
 * so "Jumble" always reads as one consistent app rather than a login
 * form that happens to lead somewhere else. The wordmark is two-toned
 * (brand blue + brand orange) rather than a single flat color, which
 * reads as more of a deliberate logo than plain page text.
 *
 * The signed-in parent's name and the log out button only render once
 * there's actually someone to show them for — this component sits above
 * the router, so it renders on /login and /signup too, where isAuthenticated
 * is false and there's nothing to show there yet.
 */
export function TopBar() {
  const { parent, isAuthenticated, logout } = useAuth()

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ position: 'relative', justifyContent: 'center', py: 1 }}>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 800, letterSpacing: '-0.02em', userSelect: 'none' }}
        >
          <Box component="span" sx={{ color: 'primary.main' }}>
            Jumb
          </Box>
          <Box component="span" sx={{ color: 'secondary.main' }}>
            le
          </Box>
        </Typography>

        {isAuthenticated && (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ position: 'absolute', right: { xs: 12, sm: 24 }, display: { xs: 'none', sm: 'flex' } }}
          >
            <Typography variant="body2" color="text.secondary">
              {parent?.displayName || parent?.email}
            </Typography>
            <Button variant="outlined" size="small" onClick={logout}>
              Log out
            </Button>
          </Stack>
        )}
      </Toolbar>

      {isAuthenticated && (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{ display: { xs: 'flex', sm: 'none' }, pb: 1.5 }}
        >
          <Typography variant="body2" color="text.secondary">
            {parent?.displayName || parent?.email}
          </Typography>
          <Button variant="outlined" size="small" onClick={logout}>
            Log out
          </Button>
        </Stack>
      )}
    </AppBar>
  )
}
