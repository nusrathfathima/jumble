import { useEffect, useState } from 'react'
import { listChildren } from '../api/children'
import { listTags } from '../api/tags'
import { SuggestionsPanel } from '../components/SuggestionsPanel'
import { ManageDrawer } from '../components/ManageDrawer'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'

// The signed-in parent's name and the log out button live in TopBar now,
// shown above every page rather than just this one — useAuth isn't
// needed here anymore for that.
//
// Layout: day-to-day, this app is just "get a suggestion" — children and
// inventory are occasional setup tasks, not something a parent looks at
// every visit. So the home page's only job is the suggestion form itself,
// given real room to breathe; children and inventory both live in the
// ManageDrawer, opened on purpose via the button below, instead of
// competing for space on the main screen.
export function HomePage() {
  const [children, setChildren] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [manageOpen, setManageOpen] = useState(false)

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
  }

  const manageLabel = loading
    ? 'Loading…'
    : `${children.length} child${children.length === 1 ? '' : 'ren'} · manage children & supplies`

  return (
    <Box sx={{ pb: 6 }}>
      <Container maxWidth="sm" sx={{ mt: { xs: 4, sm: 6 } }}>
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
            <Button variant="outlined" onClick={() => setManageOpen(true)}>
              {manageLabel}
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
                <Button variant="contained" onClick={() => setManageOpen(true)}>
                  Add a child
                </Button>
              </CardContent>
            </Card>
          ) : (
            <SuggestionsPanel childList={children} />
          )}
        </Stack>
      </Container>

      <ManageDrawer
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        childList={children}
        tags={tags}
        onChildAdded={handleChildAdded}
      />
    </Box>
  )
}
