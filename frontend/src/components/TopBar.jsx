import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Menu from '@mui/material/Menu'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Shown on every screen — login, signup, and the logged-in home page —
 * so "Jumble" always reads as one consistent app rather than a login
 * form that happens to lead somewhere else. The wordmark is two-toned
 * (brand blue + brand pink) rather than a single flat color, which
 * reads as more of a deliberate logo than plain page text. No icon next
 * to it — that was tried and didn't land, back to text only.
 *
 * One three-column CSS grid — left, centered wordmark, right — every
 * screen size, so nothing here ever needs a second row or absolute
 * positioning to line up. Signed in: clicking the name on the left opens
 * a small popover with a "Log out" button in it (the same button style
 * Settings uses for its own Log out), rather than a full-size button
 * sitting in the header at all times. Settings itself stays on the
 * right. Signed out: the login page offers a shortcut to sign up and
 * vice versa, on the right.
 */
export function TopBar({ onOpenSettings }) {
  const { parent, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [accountAnchor, setAccountAnchor] = useState(null)

  function handleLogout() {
    setAccountAnchor(null)
    logout()
  }

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          columnGap: 1,
          py: 1,
        }}
      >
        <Box sx={{ justifySelf: 'start', minWidth: 0 }}>
          {isAuthenticated && (
            <>
              <ButtonBase
                onClick={(e) => setAccountAnchor(e.currentTarget)}
                sx={{
                  borderRadius: 2,
                  px: 1,
                  py: 0.5,
                  ml: -1,
                  maxWidth: { xs: 140, sm: 220 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2" color="text.secondary" noWrap>
                  {parent?.displayName || parent?.email}
                </Typography>
              </ButtonBase>

              <Menu
                anchorEl={accountAnchor}
                open={Boolean(accountAnchor)}
                onClose={() => setAccountAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>
                    Signed in as {parent?.displayName || parent?.email}
                  </Typography>
                  <Button fullWidth variant="outlined" color="error" size="small" onClick={handleLogout}>
                    Log out
                  </Button>
                </Box>
              </Menu>
            </>
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 800, letterSpacing: '-0.02em', userSelect: 'none', justifySelf: 'center' }}
        >
          <Box component="span" sx={{ color: 'primary.main' }}>
            Jum
          </Box>
          <Box component="span" sx={{ color: 'secondary.main' }}>
            ble
          </Box>
        </Typography>

        <Box sx={{ justifySelf: 'end' }}>
          {isAuthenticated ? (
            <Button
              variant="text"
              size="small"
              onClick={onOpenSettings}
              sx={{ color: 'text.secondary', minWidth: 0, px: { xs: 1, sm: 1.5 } }}
            >
              <Typography component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
                ⚙
              </Typography>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.75 }}>
                Settings
              </Box>
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to={location.pathname === '/signup' ? '/login' : '/signup'}
              variant="outlined"
              size="small"
            >
              {location.pathname === '/signup' ? 'Log in' : 'Sign up'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
