import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { ChildList } from './ChildList'
import { InventoryChecklist } from './InventoryChecklist'
import { useAuth } from '../context/AuthContext'

const PANELS = [
  { key: 'children', label: 'Children', accent: '#2FA8E0' },
  { key: 'inventory', label: 'What you have on hand', accent: '#FF6FA5' },
]

/**
 * Reached from the ⚙ Settings button. A popup, matching the "Add a
 * child" dialog, rather than a slide-out panel. Children and inventory
 * used to be two accordions, but opening "What you have on hand" pushed
 * the children list around and made both feel cluttered at once — tabs
 * fix that by only ever showing one panel at a time.
 *
 * Both panels stay mounted the whole time the dialog is open — only
 * hidden with CSS, not unmounted — so InventoryChecklist's own data
 * fetch runs once per time you open Settings, not once per tab click.
 * Switching tabs used to remount it from scratch (a fresh spinner and a
 * fresh network round trip every time), which is what made "What you
 * have on hand" feel slow to open on the second and third visits.
 *
 * Full-screen on phones so the tab bar, chips, and slider all get real
 * room instead of being squeezed into a small centered box.
 */
export function SettingsDialog({ open, onClose, childList, tags }) {
  const { parent, logout } = useAuth()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [tab, setTab] = useState(0)

  function handleLogout() {
    onClose()
    logout()
  }

  function handleClose() {
    setTab(0)
    onClose()
  }

  const activeAccent = PANELS[tab].accent

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Settings
        <IconButton size="small" onClick={handleClose} aria-label="Close">
          <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            ✕
          </Typography>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          variant="fullWidth"
          TabIndicatorProps={{ sx: { bgcolor: activeAccent, height: 3 } }}
          sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {PANELS.map((panel, i) => (
            <Tab
              key={panel.key}
              label={panel.label}
              sx={{ fontWeight: 700, color: tab === i ? panel.accent : 'text.secondary', '&.Mui-selected': { color: panel.accent } }}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            display: tab === 0 ? 'block' : 'none',
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: '5px solid',
            borderLeftColor: PANELS[0].accent,
            borderRadius: 3,
            bgcolor: `${PANELS[0].accent}0D`,
            p: 2,
          }}
        >
          <ChildList childList={childList} tags={tags} />
        </Box>

        <Box
          sx={{
            display: tab === 1 ? 'block' : 'none',
            // The inventory tab already gets its color from each
            // checkbox, so it keeps a plain neutral container instead of
            // also washing the whole panel in pink.
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 2,
          }}
        >
          <InventoryChecklist />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Signed in as {parent?.displayName || parent?.email}
          </Typography>
          <Button variant="outlined" color="error" size="small" onClick={handleLogout}>
            Log out
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
