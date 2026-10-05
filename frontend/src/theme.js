import { createTheme } from '@mui/material/styles'

// Jumble's visual identity: "Bubblegum & Sky, refined" (design direction
// A). Same sky blue and bubblegum pink family as before, but a shade
// deeper so white text on a blue button and pink text on white both meet
// accessibility contrast. A very light blue-white page background, white
// cards, and colour used for meaning (actions, selection, each child)
// rather than decoration.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B6FA8',
      dark: '#13527D',
      light: '#E4F2FB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D63A75',
      dark: '#B52A60',
      light: '#FDE8F0',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E5484D',
    },
    warning: {
      main: '#F2A93C',
    },
    success: {
      main: '#2FB380',
    },
    background: {
      default: '#F6FAFD',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2B39',
      secondary: '#5A6B7A',
    },
    divider: '#E2ECF3',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Nunito", system-ui, sans-serif',
    h1: { fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 600 },
    button: {
      fontFamily: '"Baloo 2", system-ui, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F6FAFD',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 9,
          paddingBottom: 9,
          fontWeight: 700,
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
          borderRadius: 22,
          border: '1px solid #E2ECF3',
          boxShadow: '0 6px 20px rgba(27, 111, 168, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
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

// The sunshine-yellow accent isn't a full palette color (yellow makes a
// poor primary/secondary — too low-contrast for buttons and text), but
// it's kept available for small one-off highlights so all three brand
// colors show up somewhere in the app, not just blue and pink.
export const ACCENT_YELLOW = '#FFD23F'
export const ACCENT_YELLOW_TEXT = '#5B4400'

// A small rotating palette reserved for interest tags specifically — each
// tag slug always resolves to the same color (via a simple string hash),
// so a given interest reads consistently everywhere it appears (a child's
// profile, the "add a child" picker, anywhere else tags show up later)
// rather than shifting color on every render. Kept separate from the
// theme's own primary/secondary so the brand colors stay reserved for
// actions and structure, and this variety stays reserved for content.
const TAG_COLORS = ['#FF6FA5', '#2FA8E0', '#FFD23F', '#4CD3A0', '#B78CFF', '#FF9142', '#4FD1E8', '#FF5C7A']

export function colorForTag(slug) {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  }
  return TAG_COLORS[hash % TAG_COLORS.length]
}

// The wordmark's two tones. Slightly brighter than primary/secondary
// because it is large text, which only needs 3:1 contrast.
export const WORDMARK_BLUE = '#1F8FCF'
export const WORDMARK_PINK = '#E2558C'

// Soft background + readable foreground pairs, used for child avatars and
// activity thumbnails. Each pair passes text contrast on its own
// background, unlike the bright TAG_COLORS above, which are only safe as
// borders and fills.
const SOFT_PAIRS = [
  { bg: '#FDE8F0', fg: '#B52A60' },
  { bg: '#FFF3C4', fg: '#7A5A00' },
  { bg: '#E4F2FB', fg: '#13527D' },
  { bg: '#E3F5EC', fg: '#1E6B47' },
  { bg: '#EFE7FF', fg: '#5B3BA8' },
  { bg: '#FFE9DA', fg: '#8A3D0F' },
]

export function softColorFor(key) {
  const text = String(key)
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return SOFT_PAIRS[hash % SOFT_PAIRS.length]
}
