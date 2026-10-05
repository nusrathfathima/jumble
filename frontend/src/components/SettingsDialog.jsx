import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useAuth } from '../context/AuthContext'
import { CloseIcon } from './Icons'
import { InventoryChecklist } from './InventoryChecklist'
import { LocationSetting } from './LocationSetting'
import { SettingsSection } from './SettingsSection'

/**
 * Settings, from the header. Children now live on their own Kids tab, so
 * this is just the things a parent sets once and rarely touches: the
 * location for weather (short, so it sits first), the supplies at home,
 * and the account.
 * Same light background, white section cards and type as the main
 * pages, so it reads as part of the same app. Full screen on phones.
 */
export function SettingsDialog({ open, onClose, locationSet, onLocationChanged }) {
  const { parent, logout } = useAuth()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  function handleLogout() {
    onClose()
    logout()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      slotProps={{ paper: { sx: { bgcolor: 'background.default' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography component="span" sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: 28, fontWeight: 800 }}>
          Settings
        </Typography>
        <IconButton onClick={onClose} aria-label="Close" sx={{ color: 'text.secondary' }}>
          <CloseIcon size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5, pb: 1 }}>
          <LocationSetting locationSet={locationSet} onChanged={onLocationChanged} />

          <InventoryChecklist />

          <SettingsSection title="Account">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800 }} noWrap>
                  {parent?.displayName || 'Signed in'}
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }} noWrap>
                  {parent?.email}
                </Typography>
              </Box>
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Log out
              </Button>
            </Box>
          </SettingsSection>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
