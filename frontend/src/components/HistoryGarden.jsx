import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/material/styles'
import { HEADING_FONT } from '../theme'

const grow = keyframes`
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
`

const PETALS = ['#FF8FA3', '#FFC94A', '#C9B6F5', '#FFB38A', '#9CCBF2']
const STEM = '#2F7D4F'
const LEAF = '#7CC59A'
const SPACING = 40
const GROUND_Y = 132

const RATING_WORDS = { LOVED: 'loved it', OK: 'it was okay', SKIPPED: 'skipped' }

function Flower({ x, rating, color, title, delay }) {
  const growStyle = {
    transformBox: 'fill-box',
    transformOrigin: '50% 100%',
    animation: `${grow} .8s cubic-bezier(.3,1.5,.5,1) ${delay}s both`,
  }
  if (rating === 'SKIPPED') {
    // A little bud that didn't open.
    return (
      <Box component="g" sx={growStyle}>
        <title>{title}</title>
        <path d={`M${x} ${GROUND_Y} V${GROUND_Y - 18}`} stroke={STEM} strokeWidth="3" />
        <ellipse cx={x} cy={GROUND_Y - 23} rx="5" ry="7" fill={LEAF} />
      </Box>
    )
  }
  const loved = rating === 'LOVED'
  const height = loved ? 68 : 46
  const scale = loved ? 1 : 0.7
  const top = GROUND_Y - height
  return (
    <Box component="g" sx={growStyle}>
      <title>{title}</title>
      <path d={`M${x} ${GROUND_Y} V${top}`} stroke={STEM} strokeWidth="3" />
      <path
        d={`M${x} ${top + 32} C ${x - 12} ${top + 28}, ${x - 14} ${top + 18}, ${x - 10} ${top + 14} C ${x - 4} ${top + 18}, ${x} ${top + 24}, ${x} ${top + 32} Z`}
        fill={LEAF}
      />
      <g transform={`translate(${x} ${top}) scale(${scale})`}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-9" rx="5" ry="8" fill={color} transform={`rotate(${a})`} />
        ))}
        <circle r="6" fill="#8A5A2B" />
      </g>
      {loved && <path transform={`translate(${x + 9} ${top - 24}) scale(.5)`} d="M0 6 C -8 -4, -16 4, 0 16 C 16 4, 8 -4, 0 6 Z" fill="#E5484D" />}
    </Box>
  )
}

/**
 * This month's activities as a little garden: every one plants a flower.
 * "Loved it" grows a tall flower with a heart, "Okay" a smaller one and
 * "Skipped" a bud. Oldest on the left, newest on the right. Hover or
 * long-press a flower to see which activity it was.
 */
export function HistoryGarden({ completions, childName }) {
  const now = new Date()
  const thisMonth = completions
    .filter((c) => {
      const d = new Date(c.completedAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .slice()
    .reverse()

  const loved = thisMonth.filter((c) => c.rating === 'LOVED').length
  const ok = thisMonth.filter((c) => c.rating === 'OK').length
  const skipped = thisMonth.length - loved - ok
  const width = Math.max(420, thisMonth.length * SPACING + 24)
  const label =
    thisMonth.length === 0
      ? `${childName}'s garden is empty this month`
      : `${childName}'s garden this month: ${loved} loved, ${ok} okay, ${skipped} skipped`
  const monthName = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(now)

  return (
    <Card sx={{ p: { xs: 1.75, sm: 2.25 }, bgcolor: '#E3F2E8' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Typography component="h2" sx={{ fontFamily: HEADING_FONT, fontSize: 20, fontWeight: 800 }}>
          {childName}&rsquo;s garden in {monthName}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary' }}>
          Big flower: loved it · Small: okay · Bud: skipped
        </Typography>
      </Box>
      {/* Scrolls sideways inside the card when there are lots of flowers. */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="svg"
          role="img"
          aria-label={label}
          viewBox={`0 0 ${width} 150`}
          sx={{
            display: 'block',
            width: thisMonth.length * SPACING + 24 > 420 ? width : '100%',
            maxWidth: thisMonth.length * SPACING + 24 > 420 ? 'none' : 640,
            height: 'auto',
            '@media (prefers-reduced-motion: reduce)': { '& g': { animation: 'none !important' } },
          }}
        >
          <path d={`M0 ${GROUND_Y - 4} C ${width * 0.3} ${GROUND_Y - 12}, ${width * 0.7} ${GROUND_Y + 4}, ${width} ${GROUND_Y - 6} V150 H0 Z`} fill="#B07A45" />
          {thisMonth.length === 0 ? (
            <text x={width / 2} y="80" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="700" fontSize="15" fill="#4F6656">
              Rate an activity to plant the first flower
            </text>
          ) : (
            thisMonth.map((c, i) => (
              <Flower
                key={c.id}
                x={24 + i * SPACING}
                rating={c.rating}
                color={PETALS[i % PETALS.length]}
                delay={Math.min(i * 0.1, 1.5)}
                title={`${c.activityTitle}: ${RATING_WORDS[c.rating] ?? 'done'}`}
              />
            ))
          )}
        </Box>
      </Box>
    </Card>
  )
}
