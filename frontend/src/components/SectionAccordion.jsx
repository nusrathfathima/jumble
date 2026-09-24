import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ACCENT_YELLOW, ACCENT_YELLOW_TEXT } from '../theme'

// Step 1 = primary blue, step 2 = secondary pink, step 3 = the sunshine
// accent — each home-page section gets its own color so the numbered
// badges double as a visual progress trail, not just a label.
const STEP_STYLES = [
  { bgcolor: 'primary.main', color: '#FFFFFF' },
  { bgcolor: 'secondary.main', color: '#FFFFFF' },
  { bgcolor: ACCENT_YELLOW, color: ACCENT_YELLOW_TEXT },
]

// A simple chevron built from a Typography glyph rather than
// @mui/icons-material, which isn't installed — MUI's AccordionSummary
// rotates whatever's passed as expandIcon on its own, so this still
// flips correctly on expand/collapse without adding a dependency.
function Chevron() {
  return (
    <Typography component="span" sx={{ fontSize: 22, fontWeight: 700, color: 'text.secondary', lineHeight: 1 }}>
      ⌄
    </Typography>
  )
}

/**
 * Shared shell for each of the three home-page sections (children,
 * inventory, suggestions). Collapsed by default and opened one at a time
 * from HomePage, so the page reads as three clear steps instead of one
 * long stack of cards — and each summary row stays useful even closed,
 * showing a one-line status (how many children, how many items checked,
 * and so on) so there's rarely a need to open a section just to check on it.
 */
export function SectionAccordion({ step, title, subtitle, expanded, onChange, children }) {
  const stepStyle = STEP_STYLES[step - 1] || STEP_STYLES[0]

  return (
    <Accordion expanded={expanded} onChange={onChange} disableGutters>
      <AccordionSummary expandIcon={<Chevron />}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontFamily: '"Baloo 2", system-ui, sans-serif',
              flexShrink: 0,
              ...stepStyle,
            }}
          >
            {step}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}
