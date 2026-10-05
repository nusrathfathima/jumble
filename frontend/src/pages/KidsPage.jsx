import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAppData } from '../context/AppDataContext'
import { softColorFor } from '../theme'
import { ChildAvatar } from '../components/ChildPicker'
import { PlusIcon } from '../components/Icons'

/** The Kids tab: every child with their age and interests, plus "Add a child". */
export function KidsPage() {
  const { childList, tags, loading, openAddChild } = useAppData()
  const tagName = (slug) => tags.find((t) => t.slug === slug)?.displayName ?? slug

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography component="h1" sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: 30, fontWeight: 800 }}>
          Your kids
        </Typography>
        <Button variant="contained" onClick={openAddChild} startIcon={<PlusIcon size={18} strokeWidth={2.4} />} sx={{ boxShadow: 'none' }}>
          Add a child
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && childList.length === 0 && (
        <Card>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>No kids added yet</Typography>
            <Typography color="text.secondary">Add a child and Jumble will pick ideas for their age and interests.</Typography>
          </Box>
        </Card>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
        {childList.map((child) => (
          <Card key={child.id}>
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <ChildAvatar child={child} size={56} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                  {child.name}
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: child.interestTagSlugs.length ? 1 : 0 }}>
                  {child.age} {child.age === 1 ? 'year' : 'years'} old
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {child.interestTagSlugs.map((slug) => {
                    const { bg, fg } = softColorFor(slug)
                    return (
                      <Box
                        key={slug}
                        component="span"
                        sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: bg, color: fg, fontSize: 12, fontWeight: 800 }}
                      >
                        {tagName(slug)}
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Stack>
  )
}
