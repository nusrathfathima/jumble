// The small hand-drawn garden pieces that give Jumble its kids' look:
// Sprout (the mascot), the bunting under the header, and the little
// hill scenes used for the weather card and the top pick. All plain
// inline SVG, decorative only, so every one is hidden from screen readers.
import { GREEN, GREEN_DARK, LEAF, LEAF_LIGHT, SUN } from '../theme'

const INK = '#16301F'

/** Sprout: a round little seedling with two leaves. `waving` raises one arm. */
export function Sprout({ size = 64, waving = false, style }) {
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
      <ellipse cx="28" cy="40" rx="3" ry="3.6" fill={INK} />
      <ellipse cx="44" cy="40" rx="3" ry="3.6" fill={INK} />
      <circle cx="29" cy="38.8" r="1" fill="#FFFFFF" />
      <circle cx="45" cy="38.8" r="1" fill="#FFFFFF" />
      <circle cx="22" cy="48" r="3.4" fill="#FFB38A" />
      <circle cx="50" cy="48" r="3.4" fill="#FFB38A" />
      <path d="M30 49 Q36 55 42 49" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {waving && (
        <>
          <path d="M58 44 C 66 38, 68 30, 66 24" stroke={LEAF} strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="66" cy="22" r="4.5" fill={LEAF} />
        </>
      )}
    </svg>
  )
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
export function Bunting() {
  const colors = [LEAF, '#FFB38A', '#FFD66B', '#9CCBF2']
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height="20" style={{ display: 'block' }}>
      <defs>
        <pattern id="jumble-bunting" width="152" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="152" y2="2" stroke="#B9CDBF" strokeWidth="1.2" />
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
          <SunFace />
        </g>
      )}
      <path d="M96 56 v10" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
      <circle cx="96" cy="52" r="5" fill="#FFB38A" />
      <circle cx="96" cy="52" r="2" fill={SUN} />
    </svg>
  )
}

function SunFace() {
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
        <SunFace />
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
