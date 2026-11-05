import { createTheme } from '@mui/material/styles'

// Jumble's visual identity: "Garden Party" (design direction F3). Leafy
// green for actions, warm peach as the second brand colour, and soft
// butter, sky and peach tints for variety. Headings use Grandstander, a
// bouncy hand-drawn style font that says "kids" at a glance, with
// Nunito for easy-to-read body text.

export const HEADING_FONT = '"Grandstander", "Nunito", system-ui, sans-serif'

export const GREEN = '#2F7D4F'
export const GREEN_DARK = '#1F5C38'
export const GREEN_SOFT = '#E3F2E8'
export const LEAF = '#7CC59A'
export const LEAF_LIGHT = '#A8DBB9'
export const SUN = '#FFC94A'

// Soft background + readable text colour pairs. Each pair passes text
// contrast on its own background.
export const PEACH = { bg: '#FFE5D6', fg: '#9A4316' }
export const SKY = { bg: '#E1F0FF', fg: '#1E5A92' }
export const BUTTER = { bg: '#FFF5CC', fg: '#6E5400' }
export const MINT = { bg: GREEN_SOFT, fg: GREEN_DARK }
const LILAC = { bg: '#EFE7FF', fg: '#5B3BA8' }
const ROSE = { bg: '#FFE3EC', fg: '#A3204F' }

// The wordmark's two tones: "Jum" in green, "ble" in peach. Large text,
// so 3:1 contrast is enough.
export const WORDMARK_GREEN = GREEN
export const WORDMARK_PEACH = '#E0703F'

// Subtle confetti across the whole page background: small, pale dots in
// the brand tints. Two tile sizes overlap so the pattern never looks
// like an obvious grid.
const dot = (x, y, r, rgba) => `radial-gradient(circle at ${x}px ${y}px, ${rgba} ${r}px, transparent ${r + 0.6}px)`
export const CONFETTI_A = [
  dot(30, 40, 3.5, 'rgba(124, 197, 154, 0.38)'),
  dot(190, 90, 3, 'rgba(255, 179, 138, 0.42)'),
  dot(110, 210, 4, 'rgba(255, 214, 107, 0.42)'),
  dot(250, 250, 3, 'rgba(156, 203, 242, 0.45)'),
]
export const CONFETTI_B = [
  dot(70, 130, 3, 'rgba(255, 179, 138, 0.35)'),
  dot(300, 40, 3.5, 'rgba(156, 203, 242, 0.40)'),
  dot(220, 320, 3, 'rgba(124, 197, 154, 0.35)'),
  dot(340, 190, 2.5, 'rgba(255, 214, 107, 0.45)'),
]

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: GREEN,
      dark: GREEN_DARK,
      light: GREEN_SOFT,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C25A2A',
      dark: '#9A4316',
      light: '#FFE5D6',
      contrastText: '#FFFFFF',
    },
    error: { main: '#D64545' },
    warning: { main: '#E6A23C' },
    success: { main: '#2F9E62', dark: '#1F6E43' },
    background: {
      default: '#F3F8F4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#16301F',
      secondary: '#4F6656',
    },
    divider: '#DCE8DF',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Nunito", system-ui, sans-serif',
    h1: { fontFamily: HEADING_FONT, fontWeight: 800 },
    h2: { fontFamily: HEADING_FONT, fontWeight: 800 },
    h3: { fontFamily: HEADING_FONT, fontWeight: 800 },
    h4: { fontFamily: HEADING_FONT, fontWeight: 800 },
    h5: { fontFamily: HEADING_FONT, fontWeight: 800 },
    h6: { fontFamily: HEADING_FONT, fontWeight: 800 },
    button: {
      fontFamily: '"Nunito", system-ui, sans-serif',
      fontWeight: 800,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // The confetti dots are drawn by <MovingDots /> so they can drift.
          backgroundColor: '#F3F8F4',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 9,
          paddingBottom: 9,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '1px solid #DCE8DF',
          boxShadow: '0 10px 24px rgba(47, 125, 79, 0.10)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 800,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
})

// Bright tag colours, used for interest-tag chips in the "Add a child"
// form (as borders and light fills only, never as text on white).
const TAG_COLORS = ['#FF8A5B', '#2F9E62', '#E6A23C', '#4A90D9', '#9B6BDB', '#E05A8A', '#2BB3A3', '#D9822B']

function hashOf(text) {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return hash
}

export function colorForTag(slug) {
  return TAG_COLORS[hashOf(String(slug)) % TAG_COLORS.length]
}

const SOFT_PAIRS = [PEACH, SKY, BUTTER, MINT, LILAC, ROSE]

// A soft { bg, fg } pair that stays the same for a given key (a child's
// id, an activity id, a category), for avatars and thumbnails.
export function softColorFor(key) {
  return SOFT_PAIRS[hashOf(String(key)) % SOFT_PAIRS.length]
}
