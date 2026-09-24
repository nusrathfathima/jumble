import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { ChildList } from './ChildList'
import { InventoryChecklist } from './InventoryChecklist'
import { useAuth } from '../context/AuthContext'

// A simple chevron built from a Typography glyph rather than
// @mui/icons-material, which isn't installed — MUI's AccordionSummary
// rotates whatever's passed as expandIcon on its own, so this still
// flips correctly on expand/collapse without adding a dependency.
function Chevron() {
  return (
    <Typography component="span" sx={{ fontSize: 20, fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>
      ⌄
    </Typography>
  )
}

function accordionSx(accent) {
  return {
    border: '1px solid',
    borderColor: 'divider',
    borderLeft: '5px solid',
    borderLeftColor: accent,
    borderRadius: 3,
    bgcolor: `${accent}0D`,
    '&:before': { display: 'none' },
    '&.Mui-expanded': { margin: 0 },
  }
}

/**
 * Reached from the ⚙ Settings button in the header. A popup (matching the
 * "Add a child" dialog) rather than a slide-out panel, so it behaves the
 * same way every other quick action in the app does. Both accordions
 * start closed every time it opens — nothing to collapse manually, no
 * clutter on open — and each has its own color, matching the playful
 * treatment the child cards and suggestion cards already use. Log out
 * lives here too, since it's an occasional account action rather than
 * something that needs to sit in the header on every screen.
 */
export function SettingsDialog({ open, onClose, childList, tags }) {
  const { parent, logout } = useAuth()

  function handleLogout() {
    onClose()
    logout()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Settings
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            ✕
          </Typography>
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Accordion disableGutters sx={accordionSx('#2FA8E0')}>
            <AccordionSummary expandIcon={<Chevron />}>
              <Typography variant="subtitle1" fontWeight={700}>
                Children
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ChildList childList={childList} tags={tags} />
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={accordionSx('#FF6FA5')}>
            <AccordionSummary expandIcon={<Chevron />}>
              <Typography variant="subtitle1" fontWeight={700}>
                What you have on hand
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <InventoryChecklist />
            </AccordionDetails>
          </Accordion>

          <Divider />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Signed in as {parent?.displayName || parent?.email}
            </Typography>
            <Button variant="outlined" color="error" size="small" onClick={handleLogout}>
              Log out
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
