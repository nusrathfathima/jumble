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
import { getSuggestions } from '../api/suggestions'
import { recordCompletion } from '../api/completions'
import { ApiError } from '../api/client'

// Rating buttons shown on each suggestion card. The value sent to the
// backend has to match the CHECK constraint on completion.rating exactly
// (LOVED | OK | SKIPPED) — see CompletionController.RecordCompletionRequest.
const RATINGS = [
  { value: 'LOVED', label: 'Loved it', color: 'primary' },
  { value: 'OK', label: 'It was okay', color: 'secondary' },
  { value: 'SKIPPED', label: 'Skipped', color: 'inherit' },
]

export function SuggestionsPanel({ childList }) {
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

        <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              id="suggestChild"
              label="For"
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

            <TextField
              id="availableMinutes"
              label="Minutes available"
              type="number"
              fullWidth
              inputProps={{ min: 1 }}
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(e.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              id="maxMessLevel"
              label="Mess tolerance"
              select
              fullWidth
              value={maxMessLevel}
              onChange={(e) => setMaxMessLevel(e.target.value)}
            >
              <MenuItem value={1}>Low mess only</MenuItem>
              <MenuItem value={2}>Some mess okay</MenuItem>
              <MenuItem value={3}>Any mess level</MenuItem>
            </TextField>

            <TextField
              id="locationType"
              label="Where"
              select
              fullWidth
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
            >
              <MenuItem value="EITHER">No preference</MenuItem>
              <MenuItem value="INDOOR">Indoor</MenuItem>
              <MenuItem value="OUTDOOR">Outdoor</MenuItem>
            </TextField>
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
              <Stack spacing={1.5}>
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
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {suggestions && suggestions.suggestions.length > 0 && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {suggestions.suggestions.map((s) => {
            const status = feedbackStatus[s.activityId]
            const isDone = status === 'done'
            const isSubmitting = status === 'submitting'
            const errorMessage = status && status !== 'submitting' && status !== 'done' ? status : null

            return (
              <Box
                key={s.activityId}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {s.title}
                  </Typography>
                  <Chip size="small" label={`${s.durationMinutes} min`} variant="outlined" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {s.explanation}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {isDone ? (
                  <Typography variant="body2" color="secondary.main">
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
        </Stack>
      )}
      </CardContent>
    </Card>
  )
}
