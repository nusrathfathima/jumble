import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { GREEN_DARK, HEADING_FONT } from '../theme'
import { Sprout } from './Garden'
import { ActivityIcon, DiceIcon } from './Icons'

// One colour per idea, so the same idea always has the same colour on the
// wheel. Icons on top are dark ink, which reads on every one of these.
const SEGMENT_COLORS = ['#FFB38A', '#7CC59A', '#9CCBF2', '#FFD66B', '#C9B6F5', '#F7A8C1']
const INK = '#16301F'
const SPIN_MS = 4200
const RADIUS = 104

const PRESSABLE = {
  borderRadius: 999,
  fontFamily: HEADING_FONT,
  fontWeight: 800,
  boxShadow: `0 5px 0 ${GREEN_DARK}`,
  '&:hover': { boxShadow: `0 5px 0 ${GREEN_DARK}` },
  '&:active': { boxShadow: `0 2px 0 ${GREEN_DARK}`, transform: 'translateY(3px)' },
  '&.Mui-disabled': { boxShadow: 'none' },
}

function point(angleDeg, r) {
  const a = (angleDeg * Math.PI) / 180
  return [r * Math.sin(a), -r * Math.cos(a)]
}

/**
 * "Spin the wheel": every idea gets a slice (repeated so there are always
 * at least six, which looks like a proper wheel). Pressing Spin turns it
 * a few times and it lands on one idea, which is handed to `onLanded`.
 *
 * The landing slice is chosen first and the wheel is turned to it, so
 * the result never depends on a rounding error at a slice edge.
 */
export function SpinWheel({ suggestions, childName, hasPick, onLanded }) {
  const count = suggestions.length
  const slices = count * Math.ceil(6 / count)
  const sliceAngle = 360 / slices

  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [cheering, setCheering] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const pendingRef = useRef(null)

  function finish() {
    const landed = pendingRef.current
    if (!landed) return
    pendingRef.current = null
    setSpinning(false)
    setCheering(true)
    window.setTimeout(() => setCheering(false), 1800)
    setAnnouncement(`The wheel picked ${landed.title}`)
    onLanded(landed.activityId)
  }

  function spin() {
    if (spinning) return
    const slice = Math.floor(Math.random() * slices)
    // Somewhere inside the slice, never right on its edge.
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.6
    const target = (slice + 0.5) * sliceAngle + jitter
    const base = rotation - (rotation % 360)
    const next = base + 360 * 6 + ((360 - target) % 360)

    pendingRef.current = suggestions[slice % count]
    setSpinning(true)
    setCheering(false)
    setAnnouncement('')
    setRotation(next)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) window.setTimeout(finish, 50)
  }

  const paths = []
  for (let k = 0; k < slices; k++) {
    const s = suggestions[k % count]
    const a0 = k * sliceAngle
    const a1 = (k + 1) * sliceAngle
    const mid = (a0 + a1) / 2
    const [x0, y0] = point(a0, RADIUS)
    const [x1, y1] = point(a1, RADIUS)
    const [ix, iy] = point(mid, RADIUS * 0.64)
    const iconSize = slices > 8 ? 22 : 28
    paths.push(
      <g key={k}>
        <path
          d={`M0 0 L${x0} ${y0} A${RADIUS} ${RADIUS} 0 0 1 ${x1} ${y1} Z`}
          fill={SEGMENT_COLORS[(k % count) % SEGMENT_COLORS.length]}
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <g transform={`translate(${ix} ${iy}) rotate(${mid}) translate(${-iconSize / 2} ${-iconSize / 2})`} style={{ color: INK }}>
          <ActivityIcon activityId={s.activityId} size={iconSize} strokeWidth={2.2} />
        </g>
      </g>,
    )
  }
  const studs = Array.from({ length: 18 }, (_, k) => {
    const [x, y] = point(k * 20, RADIUS + 2.5)
    return <circle key={k} cx={x} cy={y} r="2.2" fill="#FFD66B" />
  })

  return (
    <Card sx={{ position: 'relative', p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, bgcolor: '#E1F0FF' }}>
      <Typography component="h2" sx={{ fontFamily: HEADING_FONT, fontSize: { xs: 20, sm: 22 }, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
        {hasPick ? 'Want a different one? Spin again!' : `Spin the wheel${childName ? `, ${childName}` : ''}!`}
      </Typography>

      <Box sx={{ position: 'relative', width: { xs: 250, sm: 290 }, maxWidth: '100%', aspectRatio: '1' }}>
        {/* The pointer at the top that shows which slice won. */}
        <Box
          component="svg"
          viewBox="0 0 34 40"
          aria-hidden="true"
          sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 34, height: 40, zIndex: 2 }}
        >
          <path d="M17 38 L3 6 Q17 -4 31 6 Z" fill="#E0703F" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
        </Box>

        <Box
          component="svg"
          viewBox="-110 -110 220 220"
          aria-hidden="true"
          onTransitionEnd={(e) => e.propertyName === 'transform' && finish()}
          sx={{
            width: '100%',
            height: '100%',
            display: 'block',
            transform: `rotate(${rotation}deg)`,
            transition: `transform ${SPIN_MS}ms cubic-bezier(.12,.75,.15,1)`,
            filter: 'drop-shadow(0 6px 0 rgba(30, 90, 146, 0.18))',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <circle r="109" fill="#FFFFFF" />
          {paths}
          {studs}
        </Box>

        {/* Sprout sits in the middle and cheers when the wheel stops. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            m: 'auto',
            width: 70,
            height: 70,
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(22, 48, 31, 0.15)',
          }}
        >
          <Sprout size={56} face={cheering ? 'star' : 'happy'} />
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={spin}
        disabled={spinning}
        startIcon={<DiceIcon size={20} strokeWidth={2.2} />}
        sx={{ ...PRESSABLE, height: 52, px: 4, fontSize: 19 }}
      >
        {spinning ? 'Spinning…' : hasPick ? 'Spin again' : 'Spin!'}
      </Button>

      <Box role="status" aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {announcement}
      </Box>
    </Card>
  )
}
