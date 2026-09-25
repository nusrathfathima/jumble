import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Link from '@mui/material/Link'
import { getSuggestions } from '../api/suggestions'
import { recordCompletion } from '../api/completions'
import { ApiError } from '../api/client'
import { colorForTag } from '../theme'

// Rating buttons shown on each suggestion card. The value sent to the
// backend has to match the CHECK constraint on completion.rating exactly
// (LOVED | OK | SKIPPED) — see CompletionController.RecordCompletionRequest.
const RATINGS = [
  { value: 'LOVED', label: 'Loved it', color: 'primary' },
  { value: 'OK', label: 'It was okay', color: 'secondary' },
  { value: 'SKIPPED', label: 'Skipped', color: 'inherit' },
]

// Marks for the "minutes available" slider — a scrub instead of a number
// field you'd otherwise have to click a tiny up/down arrow many times to
// move, and a lot friendlier to use with a finger on a phone.
const TIME_MARKS = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
]

// The default MUI floating label shrinks to a small, light-gray line once
// a field has a value — barely visible, and these three selects always
// have a value. Rather than fight that built-in label's own styling
// (which didn't actually get more readable when bolded via its own sx),
// each field below gets its own plain, bold, dark label sitting above it
// instead — same pattern as "Minutes available" — and skips MUI's
// built-in floating label entirely so there's only one label to read.
function FieldLabel({ children }) {
  return (
    <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
      {children}
    </Typography>
  )
}

// The one line above the form that says what today's weather is and
// what that means for the suggestions. Open-Meteo's free tier requires a
// credit line (CC BY licence), so the small link at the end is required,
// not decoration.
function WeatherLine({ weather }) {
  if (!weather) {
    return null
  }

  if (!weather.locationSet) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Want rainy-day smarts? Add your location in Settings.
      </Typography>
    )
  }

  if (!weather.available) {
    return null
  }

  const temp = weather.tempC != null ? `, ${Math.round(weather.tempC)}°C` : ''
  const wet = weather.outdoorFriendly === false

  return (
    <Box
      sx={{
        mb: 2,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: wet ? '#2FA8E014' : 'action.hover',
      }}
    >
      <Typography variant="body2" color="text.primary">
        <Typography component="span" fontWeight={700}>
          Today: {weather.condition}
          {temp}
        </Typography>
        {wet && ' · showing indoor ideas, unless you pick Outdoor.'}
      </Typography>
      <Link
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        variant="caption"
        color="text.secondary"
        underline="hover"
      >
        Weather data by Open-Meteo.com
      </Link>
    </Box>
  )
}

export function SuggestionsPanel({ childList, weather }) {
  const [childId, setChildId] = useState(childList[0]?.id ?? '')
  const [availableMinutes, setAvailableMinutes] = useState(30)
  const [maxMessLevel, setMaxMessLevel] = useState(3)
  const [locationType, setLocationType] = useState('EITHER')
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Keyed by activityId: 'submitting', 'done', or an error message string.
  // A plain object rather than one shared status, since several cards can
  // be in different states at once (one already rated, another mid-submit).
  const [feedbackStatus, setFeedbackStatus] = useState({})

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    setSuggestions(null)
    setFeedbackStatus({})

    try {
      const result = await getSuggestions(childId, {
        availableMinutes: Number(availableMinutes),
        maxMessLevel: Number(maxMessLevel),
        locationType,
      })
      setSuggestions(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not get suggestions right now.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFeedback(activityId, rating) {
    setFeedbackStatus((prev) => ({ ...prev, [activityId]: 'submitting' }))
    try {
      await recordCompletion(childId, { activityId, rating })
      setFeedbackStatus((prev) => ({ ...prev, [activityId]: 'done' }))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save that — try again.'
      setFeedbackStatus((prev) => ({ ...prev, [activityId]: message }))
    }
  }

  if (childList.length === 0) {
    return null
  }

  return (
    <Card
      sx={{
        borderTop: '4px solid',
        borderTopColor: 'primary.main',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, textAlign: 'left' }}>
        <Typography variant="h5" gutterBottom>
          Get a suggestion
        </Typography>

        <WeatherLine weather={weather} />

        <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Box>
            <FieldLabel>For</FieldLabel>
            <TextField
              id="suggestChild"
              select
              fullWidth
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
            >
              {childList.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ px: { xs: 0.5, sm: 1 } }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Minutes available: <Typography component="span" fontWeight={700} color="text.primary">{availableMinutes} min</Typography>
            </Typography>
            <Slider
              value={typeof availableMinutes === 'number' ? availableMinutes : Number(availableMinutes) || 15}
              onChange={(e, value) => setAvailableMinutes(value)}
              min={15}
              max={120}
              step={5}
              marks={TIME_MARKS}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}m`}
              sx={{ mt: 1 }}
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel>Mess tolerance</FieldLabel>
              <TextField
                id="maxMessLevel"
                select
                fullWidth
                value={maxMessLevel}
                onChange={(e) => setMaxMessLevel(e.target.value)}
              >
                <MenuItem value={1}>Low mess only</MenuItem>
                <MenuItem value={2}>Some mess okay</MenuItem>
                <MenuItem value={3}>Any mess level</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ flex: 1 }}>
              <FieldLabel>Where</FieldLabel>
              <TextField
                id="locationType"
                select
                fullWidth
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
              >
                <MenuItem value="EITHER">No preference</MenuItem>
                <MenuItem value="INDOOR">Indoor</MenuItem>
                <MenuItem value="OUTDOOR">Outdoor</MenuItem>
              </TextField>
            </Box>
          </Stack>

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Finding ideas…' : 'Get a suggestion'}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {suggestions?.weatherWarning && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {suggestions.weatherWarning}
        </Alert>
      )}

      {suggestions && suggestions.suggestions.length === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary">
            Nothing matched those constraints exactly. Try more time, a higher mess tolerance, or a different
            location.
          </Typography>

          {suggestions.nearMisses.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                You&rsquo;re close on a few — just missing some materials:
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                {suggestions.nearMisses.map((nm) => (
                  <Box
                    key={nm.activityId}
                    sx={{
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 3,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {nm.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {nm.durationMinutes} minutes
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Missing: {nm.missingMaterials.join(', ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {suggestions && suggestions.suggestions.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mt: 2,
          }}
        >
          {suggestions.suggestions.map((s) => {
            const status = feedbackStatus[s.activityId]
            const isDone = status === 'done'
            const isSubmitting = status === 'submitting'
            const errorMessage = status && status !== 'submitting' && status !== 'done' ? status : null
            // Each card gets its own color from the same hash used for
            // interest tags, so a list of suggestions reads as varied and
            // fun rather than a wall of identical gray boxes — while still
            // being the same color every time that particular activity
            // comes up.
            const accent = colorForTag(String(s.activityId))

            return (
              <Box
                key={s.activityId}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: '5px solid',
                  borderLeftColor: accent,
                  borderRadius: 3,
                  p: 2,
                  bgcolor: `${accent}0D`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: accent, lineHeight: 1.2 }}>
                    {s.title}
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${s.durationMinutes} min`}
                    sx={{ borderColor: `${accent}66`, color: 'text.secondary', flexShrink: 0, fontWeight: 500 }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {s.explanation}
                </Typography>

                <Divider sx={{ my: 1.5, borderColor: `${accent}33` }} />

                {isDone ? (
                  <Typography variant="body2" color="secondary.main" fontWeight={600}>
                    Thanks — that&rsquo;s saved, and it&rsquo;ll shape what gets suggested next time.
                  </Typography>
                ) : (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Did you try this?
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {RATINGS.map((r) => (
                        <Button
                          key={r.value}
                          size="small"
                          variant="outlined"
                          color={r.color}
                          disabled={isSubmitting}
                          onClick={() => handleFeedback(s.activityId, r.value)}
                        >
                          {r.label}
                        </Button>
                      ))}
                    </Stack>
                    {errorMessage && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errorMessage}
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      )}
      </CardContent>
    </Card>
  )
}
