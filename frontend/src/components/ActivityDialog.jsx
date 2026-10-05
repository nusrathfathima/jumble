import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { getActivity } from '../api/activities'
import { ApiError } from '../api/client'
import { CloseIcon } from './Icons'
import { LOCATION_LABELS, MESS_LABELS, formatMinutes } from './activityLabels'

const RATINGS = [
  { value: 'LOVED', label: 'Loved it', variant: 'contained' },
  { value: 'OK', label: 'It was okay', variant: 'outlined' },
  { value: 'SKIPPED', label: 'Skipped it', variant: 'outlined' },
]

/**
 * "Let's start": how to do one activity — what you need, then the steps
 * in order — with the "How did it go?" rating at the end, where it
 * naturally belongs once you've actually done it. Full screen on phones
 * so it's easy to follow along with the phone propped up.
 */
export function ActivityDialog({ activityId, open, onClose, childName, ratingStatus, onRate }) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  // Tagged with the activity id it belongs to, so opening a different
  // activity never flashes the previous one's steps.
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    if (!open || !activityId) return
    let cancelled = false
    getActivity(activityId)
      .then((data) => !cancelled && setLoaded({ id: activityId, data }))
      .catch(
        (err) =>
          !cancelled &&
          setLoaded({ id: activityId, error: err instanceof ApiError ? err.message : 'Could not load this activity.' }),
      )
    return () => {
      cancelled = true
    }
  }, [open, activityId])

  const current = loaded?.id === activityId ? loaded : null
  const detail = current?.data ?? null
  const error = current?.error ?? null

  const requiredMaterials = detail?.materials.filter((m) => !m.isOptional) ?? []
  const optionalMaterials = detail?.materials.filter((m) => m.isOptional) ?? []

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1 }}>
        <Typography component="span" variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
          {detail?.title ?? 'Loading…'}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close" sx={{ mt: -0.5, color: 'text.secondary' }}>
          <CloseIcon size={22} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}

        {!detail && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {detail && (
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", mb: 1.5 }}>
                <Chip size="small" label={formatMinutes(detail.durationMinutes)} />
                <Chip size="small" label={MESS_LABELS[detail.messLevel] ?? 'Mess varies'} />
                <Chip size="small" label={LOCATION_LABELS[detail.locationType] ?? detail.locationType} />
                {detail.needsAdult && <Chip size="small" color="secondary" variant="outlined" label="Needs a grown-up" />}
              </Stack>
              {detail.summary && (
                <Typography variant="body1" color="text.secondary">
                  {detail.summary}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                What you need
              </Typography>
              {requiredMaterials.length === 0 && optionalMaterials.length === 0 ? (
                <Typography color="text.secondary">Nothing at all, just yourselves.</Typography>
              ) : (
                <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {requiredMaterials.map((m) => (
                    <Typography component="li" key={m.slug}>
                      {m.displayName}
                    </Typography>
                  ))}
                  {optionalMaterials.map((m) => (
                    <Typography component="li" key={m.slug} color="text.secondary">
                      {m.displayName} (optional)
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                How to do it
              </Typography>
              <Stack component="ol" spacing={1.75} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {detail.steps.map((step) => (
                  <Box component="li" key={step.stepNumber} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        borderRadius: '50%',
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {step.stepNumber}
                    </Box>
                    <Box sx={{ pt: 0.5 }}>
                      <Typography>{step.shortText}</Typography>
                      {step.imageUrl && (
                        <Box
                          component="img"
                          src={step.imageUrl}
                          alt={step.imageAlt ?? ''}
                          loading="lazy"
                          sx={{ mt: 1, width: '100%', maxWidth: 360, borderRadius: '12px', display: 'block' }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5, pb: 1 }}>
              {ratingStatus === 'done' ? (
                <Alert severity="success">Saved. It will shape what gets suggested next time.</Alert>
              ) : (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.25 }}>
                    How did it go{childName ? ` for ${childName}` : ''}?
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    {RATINGS.map((r) => (
                      <Button
                        key={r.value}
                        variant={r.variant}
                        disabled={ratingStatus === 'submitting'}
                        onClick={() => onRate(r.value)}
                      >
                        {r.label}
                      </Button>
                    ))}
                  </Stack>
                  {ratingStatus && ratingStatus !== 'submitting' && (
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                      {ratingStatus}
                    </Alert>
                  )}
                </>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}
