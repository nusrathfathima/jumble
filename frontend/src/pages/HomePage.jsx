import { useEffect, useState } from 'react'
import { listChildren } from '../api/children'
import { listTags } from '../api/tags'
import { AddChildForm } from '../components/AddChildForm'
import { SuggestionsPanel } from '../components/SuggestionsPanel'
import { SettingsDialog } from '../components/SettingsDialog'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'

// The signed-in parent's name and the log out button live in TopBar now,
// shown above every page rather than just this one — useAuth isn't
// needed here anymore for that.
//
// Layout: day-to-day, this app is just "get a suggestion" — children and
// inventory are occasional setup tasks, not something a parent looks at
// every visit. So the home page's only job is the suggestion form itself,
// given real room to breathe. Adding a child is a quick "Add a child"
// dialog right here; everything else (the child list, what's on hand)
// lives in the Settings drawer, opened from the header.
export function HomePage({ settingsOpen, onCloseSettings }) {
  const [children, setChildren] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [addChildOpen, setAddChildOpen] = useState(false)

  useEffect(() => {
    Promise.all([listChildren(), listTags()])
      .then(([childrenData, tagsData]) => {
        setChildren(childrenData)
        setTags(tagsData)
      })
      // A failure here (expired token, backend down) is left silent in the
      // UI beyond staying in the loading/empty state — good enough for
      // this stage; a proper error banner can come once there's more than
      // one screen relying on this pattern.
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleChildAdded(child) {
    setChildren((prev) => [...prev, child])
    setAddChildOpen(false)
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Container maxWidth="md" sx={{ mt: { xs: 4, sm: 6 } }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              What should we do today?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Only suggests things you can actually do right now, with what you already have.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => setAddChildOpen(true)}>
              Add a child
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : children.length === 0 ? (
            <Card>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Add your first child to get started
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Suggestions are tailored to each child&rsquo;s age and interests.
                </Typography>
                <Button variant="contained" onClick={() => setAddChildOpen(true)}>
                  Add a child
                </Button>
              </CardContent>
            </Card>
          ) : (
            <SuggestionsPanel childList={children} />
          )}
        </Stack>
      </Container>

      <Dialog open={addChildOpen} onClose={() => setAddChildOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add a child
          <IconButton size="small" onClick={() => setAddChildOpen(false)} aria-label="Close">
            <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
              ✕
            </Typography>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddChildForm tags={tags} onChildAdded={handleChildAdded} />
        </DialogContent>
      </Dialog>

      <SettingsDialog open={settingsOpen} onClose={onCloseSettings} childList={children} tags={tags} />
    </Box>
  )
}
