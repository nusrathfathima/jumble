// The small hand-drawn garden pieces that give Jumble its kids' look:
// Sprout (the mascot), the bunting under the header, and the little
// hill scenes used for the weather card and the top pick. All plain
// inline SVG, decorative only, so every one is hidden from screen readers.
import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import { keyframes } from '@mui/material/styles'
import { CONFETTI_A, CONFETTI_B, GREEN, GREEN_DARK, LEAF, LEAF_LIGHT, SUN } from '../theme'

const INK = '#16301F'

/**
 * Sprout: a round little seedling with two leaves. `waving` raises one arm.
 * `face` changes the expression: 'happy' (default), 'star' (star eyes and a
 * big grin, for cheering), 'ok' (a small smile) or 'sleepy' (closed eyes).
 * `watch` makes Sprout's eyes follow the mouse or finger around the screen.
 */
export function Sprout({ size = 64, waving = false, face = 'happy', watch = false, style }) {
  const svgRef = useRef(null)
  const eyesRef = useRef(null)

  // The eyes are moved directly (no React re-render), at most once per
  // frame, by up to 3 units toward the pointer.
  useEffect(() => {
    if (!watch) return undefined
    let frame = 0
    function onMove(e) {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const svg = svgRef.current
        const eyes = eyesRef.current
        if (!svg || !eyes) return
        const box = svg.getBoundingClientRect()
        const cx = box.left + box.width / 2
        const cy = box.top + box.height * 0.55
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const pull = Math.min(1, Math.hypot(dx, dy) / 220)
        const angle = Math.atan2(dy, dx)
        eyes.setAttribute('transform', `translate(${(Math.cos(angle) * 3 * pull).toFixed(2)} ${(Math.sin(angle) * 3 * pull).toFixed(2)})`)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [watch])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox={waving ? '0 -2 76 74' : '0 0 72 72'}
      style={{ flexShrink: 0, display: 'block', overflow: 'visible', ...style }}
    >
      <path d="M36 22 V12" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
      <path d="M36 14 C 26 14, 20 6, 22 0 C 31 0, 36 6, 36 14 Z" fill={LEAF} />
      <path d="M36 12 C 44 12, 52 6, 52 0 C 43 -1, 37 5, 36 12 Z" fill={GREEN} />
      <circle cx="36" cy="44" r="25" fill={LEAF} />
      <ellipse cx="36" cy="50" rx="17" ry="13" fill={LEAF_LIGHT} />
      <g ref={eyesRef}>
        <SproutEyes face={face} />
      </g>
      <circle cx="22" cy="48" r="3.4" fill="#FFB38A" />
      <circle cx="50" cy="48" r="3.4" fill="#FFB38A" />
      <SproutMouth face={face} />
      {waving && (
        <>
          <path d="M58 44 C 66 38, 68 30, 66 24" stroke={LEAF} strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="66" cy="22" r="4.5" fill={LEAF} />
        </>
      )}
    </svg>
  )
}

const STAR = 'l1.6 3.4 3.6.4-2.7 2.4.8 3.6L{x} 43l-3.3 1.8.8-3.6-2.7-2.4 3.6-.4z'

function SproutEyes({ face }) {
  if (face === 'star') {
    return <path d={['M28 35' + STAR.replace('{x}', '28'), 'M44 35' + STAR.replace('{x}', '44')].join(' ')} fill={INK} />
  }
  if (face === 'sleepy') {
    return <path d="M24 41 q4 3 8 0 M40 41 q4 3 8 0" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  }
  return (
    <>
      <ellipse cx="28" cy="40" rx="3" ry="3.6" fill={INK} />
      <ellipse cx="44" cy="40" rx="3" ry="3.6" fill={INK} />
      <circle cx="29" cy="38.8" r="1" fill="#FFFFFF" />
      <circle cx="45" cy="38.8" r="1" fill="#FFFFFF" />
    </>
  )
}

function SproutMouth({ face }) {
  if (face === 'star') {
    return (
      <>
        <path d="M28 48 Q36 60 44 48 Z" fill={INK} />
        <path d="M31 53 Q36 57 41 53" fill="#FF8FA3" />
      </>
    )
  }
  if (face === 'sleepy') return <ellipse cx="36" cy="51" rx="3" ry="2.4" fill={INK} />
  if (face === 'ok') return <path d="M31 50 Q36 53 41 50" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
  return <path d="M30 49 Q36 55 42 49" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
}

/** A tiny leaf that grows on the selected child's avatar. */
export function AvatarSprout({ style }) {
  return (
    <svg aria-hidden="true" focusable="false" width="26" height="22" viewBox="0 0 26 22" style={{ display: 'block', ...style }}>
      <path d="M13 21 V10" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 12 C 6 12, 3 6, 4 2 C 10 2, 13 6, 13 12 Z" fill={LEAF} />
      <path d="M13 10 C 18 10, 22 6, 22 2 C 16 1, 13 5, 13 10 Z" fill={GREEN} />
    </svg>
  )
}

// One flag swings on the string like it's caught by a breeze.
const flagSwing = keyframes`
  0%, 100% { transform: rotate(-9deg); }
  50% { transform: rotate(9deg); }
`

/**
 * Party bunting hanging along the top of the banner. Each flag sways on
 * its own, a moment after the flag to its left, so a gentle breeze seems
 * to travel along the string from left to right. Enough flags are drawn
 * for very wide screens; the banner hides whatever doesn't fit.
 */
export function Bunting({ stringColor = '#B9CDBF' }) {
  const colors = [LEAF, '#FFB38A', '#FFD66B', '#9CCBF2']
  const flags = Array.from({ length: 72 }, (_, i) => i)
  return (
    <Box
      component="svg"
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="24"
      sx={{
        display: 'block',
        '& .flag': {
          transformBox: 'fill-box',
          transformOrigin: '50% 0',
          animation: `${flagSwing} 2.6s ease-in-out infinite`,
        },
        '@media (prefers-reduced-motion: reduce)': { '& .flag': { animation: 'none' } },
      }}
    >
      <line x1="0" y1="2" x2="100%" y2="2" stroke={stringColor} strokeWidth="1.2" />
      {flags.map((i) => (
        <path
          key={i}
          className="flag"
          d={`M${10 + i * 38} 2 L${28 + i * 38} 2 L${19 + i * 38} 17 Z`}
          fill={colors[i % colors.length]}
          // Each flag starts its swing a little later than the one before.
          style={{ animationDelay: `${(i * 0.09 - 8).toFixed(2)}s` }}
        />
      ))}
    </Box>
  )
}

function Hills() {
  return (
    <>
      <path d="M0 70 C 30 52, 60 60, 84 70 S 118 64, 118 64 V92 H0 Z" fill={LEAF_LIGHT} />
      <path d="M0 80 C 34 66, 70 74, 118 78 V92 H0 Z" fill={LEAF} />
    </>
  )
}

/** Small weather picture for the weather card: rain cloud, or a smiling sun. */
export function WeatherScene({ wet }) {
  return (
    <svg aria-hidden="true" focusable="false" width="118" height="92" viewBox="0 0 118 92" style={{ flexShrink: 0, display: 'block' }}>
      <Hills />
      {wet ? (
        <>
          <path
            d="M30 40 a12 12 0 0 1 22 -8 a14 14 0 0 1 26 6 a10 10 0 0 1 -2 20 H34 a10 10 0 0 1 -4 -18 z"
            fill="#FFFFFF"
          />
          <path d="M44 62 l-3 7 M58 62 l-3 7 M72 62 l-3 7" stroke="#5B9BD5" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : (
        <g transform="translate(56 34)">
          <SunFaceShape />
        </g>
      )}
      <path d="M96 56 v10" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
      <circle cx="96" cy="52" r="5" fill="#FFB38A" />
      <circle cx="96" cy="52" r="2" fill={SUN} />
    </svg>
  )
}

function SunFaceShape() {
  return (
    <>
      <circle cx="0" cy="0" r="15" fill={SUN} />
      <circle cx="-5" cy="-2" r="1.6" fill="#5A3E00" />
      <circle cx="5" cy="-2" r="1.6" fill="#5A3E00" />
      <path d="M-5 4 Q0 8 5 4" stroke="#5A3E00" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  )
}

/** The sky-and-hills backdrop behind the top pick, with a dotted flight path. */
export function TopPickScene() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      viewBox="0 0 350 138"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    >
      <rect width="350" height="138" fill="#E1F0FF" />
      <g transform="translate(306 32)">
        <SunFaceShape />
      </g>
      <path d="M0 108 C 70 84, 150 96, 220 108 S 350 96, 350 96 V138 H0 Z" fill={LEAF_LIGHT} />
      <path d="M0 122 C 90 104, 200 116, 350 112 V138 H0 Z" fill={LEAF} />
      <path d="M150 92 C 180 64, 200 84, 222 62" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="30" r="2.5" fill="#FFFFFF" />
      <circle cx="270" cy="70" r="2" fill="#FFFFFF" />
      <circle cx="120" cy="20" r="2" fill={GREEN_DARK} opacity="0.25" />
    </svg>
  )
}

/**
 * The little "photo" inside the top pick's snapshot: Sprout on a hill
 * under a soft sky in the idea's own colour, with a dotted flight path.
 */
export function SnapshotScene({ sky }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 230 200"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      <rect width="230" height="200" fill={sky} />
      <g transform="translate(196 36) scale(.8)">
        <SunFaceShape />
      </g>
      <path d="M30 126 C 80 86, 120 112, 160 70" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="3 8" fill="none" strokeLinecap="round" />
      <path d="M0 150 C 80 128, 150 166, 230 140 V200 H0 Z" fill={LEAF_LIGHT} />
      <path d="M0 176 C 90 160, 170 184, 230 168 V200 H0 Z" fill={LEAF} />
    </svg>
  )
}

/** The smiling sun on its own, for the header. */
export function SunFace({ size = 34 }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="-16 -16 32 32" style={{ display: 'block' }}>
      <SunFaceShape />
    </svg>
  )
}

export function Cloud({ width = 60, color = '#FFFFFF' }) {
  return (
    <svg aria-hidden="true" focusable="false" width={width} height={width * 0.55} viewBox="0 0 60 33" style={{ display: 'block' }}>
      <path d="M4 30 a9 9 0 0 1 2 -17 a12 12 0 0 1 21 -6 a14 14 0 0 1 25 8 a8 8 0 0 1 2 15 z" fill={color} />
    </svg>
  )
}

/**
 * The rolling hills along the bottom of the header. Stretches to any
 * width; the last wave is the page background colour, so the banner
 * flows straight into the page.
 */
export function GardenHills() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="58"
      viewBox="0 0 1280 58"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'block' }}
    >
      <path d="M0 22 C 256 -4, 512 28, 794 12 S 1150 -2, 1280 14 V58 H0 Z" fill="#4E9A69" />
      <path d="M0 36 C 320 22, 640 44, 960 30 S 1216 26, 1280 34 V58 H0 Z" fill={LEAF} />
      <path d="M0 48 C 384 36, 768 56, 1280 44 V58 H0 Z" fill="#F3F8F4" />
    </svg>
  )
}

// The confetti dots drift slowly upwards, one tile height per loop, so
// the loop is seamless.
const driftA = keyframes`to { transform: translateY(-280px); }`
const driftB = keyframes`to { transform: translateY(-370px); }`

/**
 * The page's background: confetti dots that drift slowly upwards, on
 * every screen size. Two layers with different tile sizes and speeds, so
 * the pattern never looks like a grid.
 */
export function MovingDots() {
  const layer = (dots, tile, anim, seconds) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: `calc(100% + ${tile}px)`,
    backgroundImage: dots.join(', '),
    backgroundSize: dots.map(() => `${tile}px ${tile}px`).join(', '),
    willChange: 'transform',
    animation: `${anim} ${seconds}s linear infinite`,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  })
  return (
    <Box aria-hidden="true" sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <Box sx={layer(CONFETTI_A, 280, driftA, 70)} />
      <Box sx={layer(CONFETTI_B, 370, driftB, 110)} />
    </Box>
  )
}

