import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { ChildList } from './ChildList'
import { AddChildForm } from './AddChildForm'
import { InventoryChecklist } from './InventoryChecklist'

/**
 * Day-to-day, Jumble is just "get a suggestion" — adding a child and
 * checking off your supplies are occasional setup tasks, not something
 * you look at every time. Rather than compete for space with the
 * suggestion form on the main screen (which is what made things feel
 * cluttered once a section was opened), both live here in a slide-out
 * panel you open on purpose and close when you're done — the home page
 * itself stays down to one clear job.
 */
export function ManageDrawer({ open, onClose, childList, tags, onChildAdded }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 3 } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">Manage children &amp; supplies</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            ✕
          </Typography>
        </IconButton>
      </Stack>

      <Stack spacing={3}>
        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
          >
            Children
          </Typography>
          <Stack spacing={2}>
            <ChildList childList={childList} tags={tags} />
            <AddChildForm tags={tags} onChildAdded={onChildAdded} />
          </Stack>
        </Box>

        <Divider />

        <InventoryChecklist />
      </Stack>
    </Drawer>
  )
}
