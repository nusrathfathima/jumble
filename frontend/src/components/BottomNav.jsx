import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClockIcon, SmileIcon, SunIcon } from './Icons'

const TABS = [
  { path: '/', label: 'Today', Icon: SunIcon },
  { path: '/kids', label: 'Kids', Icon: SmileIcon },
  { path: '/history', label: 'History', Icon: ClockIcon },
]

/**
 * The main navigation. On phones it is a tab bar fixed to the bottom of
 * the screen, where thumbs reach; on wider screens the same three tabs
 * sit as a centred row under the header instead, since a bottom bar
 * looks out of place on a desktop.
 */
export function BottomNav() {
  const theme = useTheme()
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = TABS.map(({ path, label, Icon }) => {
    const active = location.pathname === path
    return (
      <ButtonBase
        key={path}
        onClick={() => navigate(path)}
        aria-current={active ? 'page' : undefined}
        sx={{
          flexDirection: isPhone ? 'column' : 'row',
          gap: isPhone ? 0.375 : 1,
          px: isPhone ? 0 : 2.25,
          py: isPhone ? 0 : 1,
          height: isPhone ? '100%' : 'auto',
          borderRadius: isPhone ? 0 : 999,
          color: active ? 'primary.main' : 'text.secondary',
          bgcolor: !isPhone && active ? 'primary.light' : 'transparent',
          '&:hover': { color: 'primary.main' },
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'flex',
            px: isPhone ? 2 : 0,
            py: isPhone ? 0.375 : 0,
            borderRadius: 999,
            bgcolor: isPhone && active ? 'primary.light' : 'transparent',
          }}
        >
          <Icon size={22} />
        </Box>
        <Typography component="span" sx={{ fontSize: isPhone ? 12 : 14, fontWeight: active ? 800 : 700 }}>
          {label}
        </Typography>
      </ButtonBase>
    )
  })

  if (isPhone) {
    return (
      <Box
        component="nav"
        aria-label="Main"
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.appBar,
          height: 68,
          display: 'grid',
          gridTemplateColumns: `repeat(${TABS.length}, minmax(0, 1fr))`,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          // Keeps the bar clear of the home indicator on newer iPhones.
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        {tabs}
      </Box>
    )
  }

  return (
    <Box component="nav" aria-label="Main" sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 2 }}>
      {tabs}
    </Box>
  )
}
