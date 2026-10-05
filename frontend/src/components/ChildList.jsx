import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { softColorFor } from '../theme'
import { ChildAvatar } from './ChildPicker'

/** The children list inside Settings, in the same avatar style as the rest of the app. */
export function ChildList({ childList, tags }) {
  if (childList.length === 0) {
    return <Typography color="text.secondary">No children added yet.</Typography>
  }

  const displayNameFor = (slug) => tags.find((t) => t.slug === slug)?.displayName || slug

  return (
    <Stack spacing={1.5}>
      {childList.map((child) => (
        <Box key={child.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', textAlign: 'left' }}>
          <ChildAvatar child={child} size={44} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800 }}>{child.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {child.age} {child.age === 1 ? 'year' : 'years'} old
            </Typography>
            {child.interestTagSlugs.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                {child.interestTagSlugs.map((slug) => {
                  const { bg, fg } = softColorFor(slug)
                  return (
                    <Box
                      key={slug}
                      component="span"
                      sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: bg, color: fg, fontSize: 12, fontWeight: 800 }}
                    >
                      {displayNameFor(slug)}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Stack>
  )
}
