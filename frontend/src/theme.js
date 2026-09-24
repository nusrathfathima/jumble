import { createTheme } from '@mui/material/styles'

// Jumble's visual identity, take three: "Bubblegum & Sky" — a bright sky
// blue for structure and actions, a bubblegum pink for energy, and a
// sunshine-yellow accent reserved for the third step badge and small
// highlights. Background stays crisp white so these colors actually pop
// instead of fighting a tinted backdrop. This palette (over "Citrus Pop",
// "Tropical Punch", "Berry Bright") was the one picked after two earlier,
// more muted passes read as flat rather than playful.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2FA8E0',
      dark: '#1C86BB',
      light: '#6FC6ED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6FA5',
      dark: '#E14F87',
      light: '#FF9FC4',
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
      default: '#FBFEFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2A44',
      secondary: '#5B6B8C',
    },
    divider: '#E3EEF7',
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
          backgroundColor: '#FBFEFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 10,
          paddingBottom: 10,
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
          borderRadius: 20,
          border: '1px solid #E3EEF7',
          boxShadow: '0 6px 20px rgba(31, 42, 68, 0.06)',
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
