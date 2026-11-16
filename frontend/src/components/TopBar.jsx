import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import { keyframes } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GREEN, HEADING_FONT } from '../theme'
import { Bunting, Cloud, GardenHills } from './Garden'
import { ChevronDownIcon, SettingsIcon } from './Icons'

const PILL = {
  height: 40,
  px: 1.75,
  gap: 0.75,
  borderRadius: 999,
  bgcolor: 'rgba(255, 255, 255, 0.18)',
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 800,
  transition: 'background-color 150ms ease',
  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.28)' },
  '&.Mui-focusVisible': { outline: '3px solid #FFFFFF', outlineOffset: 2 },
}

// Your portfolio, linked from the top-left of the banner. Save your
// portfolio icon as frontend/public/portfolio-icon.png; until that file
// exists, a small "NF" badge shows instead.
const PORTFOLIO_URL = 'https://nusrathfathima.com'
const PORTFOLIO_ICON = '/portfolio-icon.png'

// Clouds drift slowly across the banner from left to right.
const drift = keyframes`
  from { transform: translateX(-120px); }
  to { transform: translateX(100vw); }
`

function DriftingBannerCloud({ top, width, opacity, seconds, delay }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top,
        opacity,
        animation: `${drift} ${seconds}s linear ${delay}s infinite`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', left: '30%' },
      }}
    >
      <Cloud width={width} />
    </Box>
  )
}

function PortfolioLink() {
  const [iconMissing, setIconMissing] = useState(false)
  return (
    <Tooltip title="See my other projects">
      <Box
        component="a"
        href={PORTFOLIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nusrath Fathima's portfolio (opens in a new tab)"
        sx={{
          justifySelf: 'start',
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          borderRadius: '50%',
          bgcolor: '#FFFFFF',
          border: '3px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 3px 0 rgba(22, 48, 31, 0.2)',
          overflow: 'hidden',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 150ms ease',
          '&:hover': { transform: 'scale(1.08) rotate(-4deg)' },
          '&:focus-visible': { outline: '3px solid #FFD66B', outlineOffset: 3 },
        }}
      >
        {iconMissing ? (
          <Typography component="span" sx={{ fontFamily: HEADING_FONT, fontWeight: 800, fontSize: { xs: 15, md: 17 }, color: GREEN }}>
            NF
          </Typography>
        ) : (
          <Box component="img" src={PORTFOLIO_ICON} alt="" onError={() => setIconMissing(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </Box>
    </Tooltip>
  )
}

/**
 * The green garden banner at the top of every screen: bunting swaying in
 * a breeze, clouds drifting past and rolling hills that flow down into
 * the page. "Jumble" sits in the middle, with a link to your portfolio
 * on the left. Signed in, your name sits on the right and opens
 * a small menu with Settings and Log out; signed out, a Log in / Sign up
 * shortcut sits there instead. The Today / Kids / History tabs are not
 * part of the banner; they sit just below it (see BottomNav).
 */
export function TopBar({ onOpenSettings }) {
  const { parent, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const [accountAnchor, setAccountAnchor] = useState(null)

  function handleLogout() {
    setAccountAnchor(null)
    logout()
  }

  function handleSettings() {
    setAccountAnchor(null)
    onOpenSettings()
  }

  const name = parent?.displayName || parent?.email

  return (
    <Box
      component="header"
      sx={{ position: 'relative', height: { xs: 132, md: 172 }, bgcolor: GREEN, overflow: 'hidden' }}
    >
      {/* Decoration only: bunting, clouds, hills. */}
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Bunting stringColor="rgba(255, 255, 255, 0.7)" />
        <DriftingBannerCloud top={30} width={64} opacity={0.22} seconds={70} delay={-10} />
        <DriftingBannerCloud top={58} width={46} opacity={0.18} seconds={95} delay={-55} />
        <DriftingBannerCloud top={22} width={52} opacity={0.16} seconds={120} delay={-90} />
        <GardenHills />
      </Box>

      <Box
        sx={{
          position: 'relative',
          height: { xs: 96, md: 132 },
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          px: { xs: 1.5, md: 6 },
          pt: { xs: 1.5, md: 1 },
        }}
      >
        <PortfolioLink />

        <Typography
          component="div"
          sx={{
            fontFamily: HEADING_FONT,
            fontSize: { xs: 36, md: 56 },
            fontWeight: 800,
            lineHeight: 1,
            userSelect: 'none',
            color: '#FFFFFF',
            textShadow: '0 2px 0 rgba(22, 48, 31, 0.18)',
          }}
        >
          Jum
          <Box component="span" sx={{ color: '#FFD66B' }}>
            ble
          </Box>
        </Typography>

        <Box sx={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {isAuthenticated ? (
            <ButtonBase
              onClick={(e) => setAccountAnchor(e.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(accountAnchor)}
              sx={{ ...PILL, maxWidth: { xs: 112, md: 220 } }}
            >
              <Typography component="span" noWrap sx={{ fontSize: 14, fontWeight: 800 }}>
                {name}
              </Typography>
              <ChevronDownIcon size={14} strokeWidth={2.5} />
            </ButtonBase>
          ) : (
            <ButtonBase component={RouterLink} to={location.pathname === '/signup' ? '/login' : '/signup'} sx={PILL}>
              {location.pathname === '/signup' ? 'Log in' : 'Sign up'}
            </ButtonBase>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1.5, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
            Signed in as {name}
          </Typography>
          <Button fullWidth variant="outlined" size="small" startIcon={<SettingsIcon size={17} strokeWidth={2.2} />} onClick={handleSettings}>
            Settings
          </Button>
          <Button fullWidth variant="outlined" color="error" size="small" onClick={handleLogout}>
            Log out
          </Button>
        </Box>
      </Menu>
    </Box>
  )
}
