// The small hand-drawn garden pieces that give Jumble its kids' look:
// Sprout (the mascot), the bunting under the header, and the little
// hill scenes used for the weather card and the top pick. All plain
// inline SVG, decorative only, so every one is hidden from screen readers.
import Box from '@mui/material/Box'
import { GREEN, GREEN_DARK, LEAF, LEAF_LIGHT, SUN } from '../theme'

const INK = '#16301F'

/**
 * Sprout: a round little seedling with two leaves. `waving` raises one arm.
 * `face` changes the expression: 'happy' (default), 'star' (star eyes and a
 * big grin, for cheering), 'ok' (a small smile) or 'sleepy' (closed eyes).
 */
export function Sprout({ size = 64, waving = false, face = 'happy', style }) {
  return (
    <svg
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
      <SproutEyes face={face} />
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

/**
 * Party bunting hanging under the header. A repeating SVG pattern, so it
 * fills any screen width without stretching the flags.
 */
export function Bunting({ stringColor = '#B9CDBF' }) {
  const colors = [LEAF, '#FFB38A', '#FFD66B', '#9CCBF2']
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height="20" style={{ display: 'block' }}>
      <defs>
        <pattern id="jumble-bunting" width="152" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="152" y2="2" stroke={stringColor} strokeWidth="1.2" />
          {colors.map((c, i) => (
            <path key={c} d={`M${10 + i * 38} 2 L${28 + i * 38} 2 L${19 + i * 38} 17 Z`} fill={c} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="20" fill="url(#jumble-bunting)" />
    </svg>
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

function Petals() {
  return [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
    <ellipse key={a} cx="0" cy="-17" rx="6" ry="11" fill={SUN} transform={`rotate(${a})`} />
  ))
}

function Tulip({ x, y, color, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 V60" stroke="#4E9A69" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M0 44 C -14 38, -18 26, -14 20 C -6 24, -1 34, 0 44 Z" fill={LEAF_LIGHT} />
      <path d="M-11 -2 L-11 -16 L-4 -9 L0 -18 L4 -9 L11 -16 L11 -2 C 11 8, -11 8, -11 -2 Z" fill={color} />
    </g>
  )
}

function Butterfly({ x, y, c1, c2, r = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <ellipse cx="-9" cy="-6" rx="9" ry="8" fill={c1} />
      <ellipse cx="9" cy="-6" rx="9" ry="8" fill={c1} />
      <ellipse cx="-7" cy="7" rx="6" ry="6" fill={c2} />
      <ellipse cx="7" cy="7" rx="6" ry="6" fill={c2} />
      <rect x="-1.6" y="-10" width="3.2" height="22" rx="1.6" fill={INK} />
      <path d="M0 -10 Q-4 -18 -7 -20 M0 -10 Q4 -18 7 -20" stroke={INK} strokeWidth="1.4" fill="none" />
    </g>
  )
}

function Grass({ from, to, y }) {
  const blades = []
  for (let x = from; x < to; x += 12) {
    blades.push(<path key={x} d={`M${x} ${y} Q${x + 3} ${y - 16} ${x + 7} ${y - 22} Q${x + 5} ${y - 10} ${x + 10} ${y}`} fill={LEAF} />)
  }
  return blades
}

/**
 * Garden scenery for the empty space beside the content on wide screens:
 * a sunflower, tulips and a ladybug on the left; a fruit tree, a kite and
 * a butterfly on the right. Fixed to the window edges, behind the
 * content, and only shown when there is real room for it.
 */
export function SideScenery() {
  return (
    <Box
      aria-hidden="true"
      sx={{ display: { xs: 'none', lg: 'block' }, position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <svg width="240" height="420" viewBox="0 0 240 420" style={{ position: 'absolute', left: 0, bottom: 0 }}>
        <g transform="translate(80 190)">
          <path d="M0 0 V230" stroke="#4E9A69" strokeWidth="5" strokeLinecap="round" />
          <path d="M0 90 C -26 80, -36 60, -30 50 C -12 54, -2 70, 0 90 Z" fill={LEAF} />
          <path d="M0 130 C 24 120, 34 104, 30 92 C 12 96, 2 112, 0 130 Z" fill={LEAF} />
          <Petals />
          <circle r="12" fill="#8A5A2B" />
          <circle r="5" cx="-3" cy="-3" fill="#A87440" />
        </g>
        <Tulip x={140} y={346} color="#FF9ACB" />
        <Tulip x={36} y={352} color="#9CCBF2" s={0.9} />
        <path d="M0 420 C 60 390, 160 394, 230 420 Z" fill={LEAF_LIGHT} />
        <Grass from={0} to={230} y={420} />
        <g transform="translate(170 388) rotate(-20)">
          <ellipse rx="11" ry="9" fill="#E5484D" />
          <path d="M0 -9 V9" stroke="#3A1F1F" strokeWidth="1.5" />
          <circle cx="-12" cy="0" r="5" fill="#3A1F1F" />
          <circle cx="-4" cy="-3" r="2" fill="#3A1F1F" />
          <circle cx="5" cy="3" r="2" fill="#3A1F1F" />
        </g>
        <Butterfly x={60} y={70} c1="#FFB38A" c2="#FFD66B" r={-12} />
      </svg>

      <svg width="240" height="460" viewBox="0 0 240 460" style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <g transform="translate(150 60)">
          <path d="M0 -40 L30 0 L0 50 L-30 0 Z" fill="#FFB38A" />
          <path d="M0 -40 L-30 0 L0 0 Z" fill="#FF9466" />
          <path d="M0 0 L30 0 L0 50 Z" fill="#FFC9A8" />
          <path d="M0 -40 L0 50 M-30 0 L30 0" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M0 50 C 14 80, -14 110, 4 140" stroke="#93AE9B" strokeWidth="1.6" fill="none" />
          <path d="M0 88 L12 96 L12 88 L0 96 Z" fill="#9CCBF2" />
          <path d="M-6 118 L6 126 L6 118 L-6 126 Z" fill="#FFD66B" />
        </g>
        <Butterfly x={70} y={160} c1="#9CCBF2" c2="#EFE7FF" r={14} />
        <g transform="translate(150 330)">
          <rect x="-9" y="20" width="18" height="90" rx="6" fill="#A87440" />
          <circle cx="0" cy="0" r="46" fill={LEAF} />
          <circle cx="-30" cy="18" r="30" fill="#5FAE80" />
          <circle cx="30" cy="16" r="32" fill="#5FAE80" />
          <circle cx="-14" cy="-14" r="6" fill="#FF8A7A" />
          <circle cx="18" cy="-4" r="6" fill="#FF8A7A" />
          <circle cx="-2" cy="20" r="6" fill="#FF8A7A" />
        </g>
        <path d="M0 460 C 70 432, 180 426, 240 454 V460 Z" fill={LEAF_LIGHT} />
        <Grass from={0} to={240} y={460} />
        <Tulip x={40} y={398} color="#FFD66B" s={0.9} />
      </svg>
    </Box>
  )
}
