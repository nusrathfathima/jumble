import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { ChildList } from './ChildList'
import { InventoryChecklist } from './InventoryChecklist'

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

const accordionSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 3,
  '&:before': { display: 'none' },
  '&.Mui-expanded': { margin: 0 },
}

/**
 * Reached from the ⚙ Settings button in the header. Holds the two things
 * a parent only checks on now and then — the children on file, and what's
 * currently in the supply closet — each as its own accordion so opening
 * one doesn't force a long scroll past the other. Adding a new child now
 * happens from its own "Add a child" dialog on the home page, so this
 * view is read/reference-focused rather than another add form.
 */
export function SettingsDrawer({ open, onClose, childList, tags }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 3 } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Settings</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            ✕
          </Typography>
        </IconButton>
      </Stack>

      <Stack spacing={2}>
        <Accordion disableGutters defaultExpanded sx={accordionSx}>
          <AccordionSummary expandIcon={<Chevron />}>
            <Typography variant="subtitle1" fontWeight={700}>
              Children
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ChildList childList={childList} tags={tags} />
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters sx={accordionSx}>
          <AccordionSummary expandIcon={<Chevron />}>
            <Typography variant="subtitle1" fontWeight={700}>
              What you have on hand
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InventoryChecklist />
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Drawer>
  )
}
