import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { colorForTag } from '../theme'

export function ChildList({ childList, tags }) {
  if (childList.length === 0) {
    return (
      <Typography color="text.secondary" fontStyle="italic">
        No children added yet — add one below.
      </Typography>
    )
  }

  const displayNameFor = (slug) => tags.find((t) => t.slug === slug)?.displayName || slug

  return (
    <Stack spacing={1.5}>
      {childList.map((child) => (
        <Box
          key={child.id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 2,
            textAlign: 'left',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            {child.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {child.age} years old
          </Typography>

          {child.interestTagSlugs.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {child.interestTagSlugs.map((slug) => {
                const tagColor = colorForTag(slug)
                return (
                  <Chip
                    key={slug}
                    label={displayNameFor(slug)}
                    size="small"
                    sx={{
                      borderColor: tagColor,
                      color: tagColor,
                      bgcolor: `${tagColor}1A`,
                      fontWeight: 600,
                    }}
                    variant="outlined"
                  />
                )
              })}
            </Box>
          )}
        </Box>
      ))}
    </Stack>
  )
}
