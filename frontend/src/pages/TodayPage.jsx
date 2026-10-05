import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getSuggestions } from '../api/suggestions'
import { recordCompletion } from '../api/completions'
import { getActivity } from '../api/activities'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'
import { softColorFor } from '../theme'
import { ChildPicker } from '../components/ChildPicker'
import { ChoiceTiles } from '../components/ChoiceTiles'
import { WeatherPill } from '../components/WeatherPill'
import { ActivityDialog } from '../components/ActivityDialog'
import { LOCATION_LABELS, MESS_LABELS, formatMinutes } from '../components/activityLabels'
import {
  ActivityIcon,
  BackIcon,
  ChevronRightIcon,
  DropIcon,
  EitherIcon,
  HouseIcon,
  SplatIcon,
  TidyIcon,
  TreeIcon,
} from '../components/Icons'

const TIME_MARKS = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
]

const WHERE_OPTIONS = [
  { value: 'INDOOR', label: 'Inside', Icon: HouseIcon },
  { value: 'OUTDOOR', label: 'Outside', Icon: TreeIcon },
  { value: 'EITHER', label: 'Either', Icon: EitherIcon },
]

const MESS_OPTIONS = [
  { value: 1, label: 'Tidy', Icon: TidyIcon },
  { value: 2, label: 'A little', Icon: DropIcon },
  { value: 3, label: 'Go wild', Icon: SplatIcon },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function SectionLabel({ children, htmlFor }) {
  return (
    <Typography
      component={htmlFor ? 'label' : 'h2'}
      htmlFor={htmlFor}
      sx={{ m: 0, fontSize: 15, fontWeight: 800, color: 'text.primary' }}
    >
      {children}
    </Typography>
  )
}

/**
 * The Today tab: the "what should we do?" form, and once you press
 * "Jumble it!", the ideas for that child — one top pick plus a short list
 * of alternatives. Both views live on this one page, so the back arrow
 * returns to the form with every choice still in place.
 */
export function TodayPage() {
  const { parent } = useAuth()
  const { childList, loading, weather, selectedChild, setSelectedChildId, openAddChild, openSettings } = useAppData()

  const [availableMinutes, setAvailableMinutes] = useState(30)
  const [maxMessLevel, setMaxMessLevel] = useState(3)
  const [locationType, setLocationType] = useState('EITHER')

  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  // Keyed by activityId: 'submitting', 'done', or an error message.
  const [ratingStatus, setRatingStatus] = useState({})
  const [openActivityId, setOpenActivityId] = useState(null)

  const firstName = (parent?.displayName || '').trim().split(' ')[0]

  async function handleSearch() {
    if (!selectedChild) return
    setError(null)
    setSearching(true)
    setRatingStatus({})
    try {
      const data = await getSuggestions(selectedChild.id, { availableMinutes, maxMessLevel, locationType })
      setResults({ ...data, childName: selectedChild.name, childId: selectedChild.id })
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not get ideas right now. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  async function handleRate(activityId, rating) {
    setRatingStatus((prev) => ({ ...prev, [activityId]: 'submitting' }))
    try {
      await recordCompletion(results.childId, { activityId, rating })
      setRatingStatus((prev) => ({ ...prev, [activityId]: 'done' }))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save that. Please try again.'
      setRatingStatus((prev) => ({ ...prev, [activityId]: message }))
    }
  }

  // "Shuffle" moves the current top pick to the end of the list, so the
  // next idea gets the spotlight. Tapping an alternative makes it the
  // top pick instead.
  function shuffle() {
    setResults((prev) => ({ ...prev, suggestions: [...prev.suggestions.slice(1), prev.suggestions[0]] }))
  }

  function promote(activityId) {
    setResults((prev) => {
      const chosen = prev.suggestions.find((s) => s.activityId === activityId)
      return { ...prev, suggestions: [chosen, ...prev.suggestions.filter((s) => s.activityId !== activityId)] }
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (childList.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Let&rsquo;s meet your little one
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Ideas are picked for each child&rsquo;s age and interests, so add a child to get started.
          </Typography>
          <Button variant="contained" size="large" onClick={openAddChild}>
            Add a child
          </Button>
        </Box>
      </Card>
    )
  }

  if (results) {
    const [top, ...others] = results.suggestions
    return (
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <IconButton onClick={() => setResults(null)} aria-label="Back to the form" sx={{ ml: -1, color: 'text.primary' }}>
              <BackIcon size={22} strokeWidth={2.5} />
            </IconButton>
            <Typography component="h1" sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: { xs: 22, sm: 26 }, fontWeight: 800, lineHeight: 1.15 }}>
              Ideas for {results.childName}
            </Typography>
          </Box>
          {results.suggestions.length > 1 && (
            <Button
              variant="outlined"
              size="small"
              onClick={shuffle}
              startIcon={<EitherIcon size={16} strokeWidth={2.2} />}
              sx={{ flexShrink: 0, borderRadius: 999, bgcolor: 'background.paper' }}
            >
              Shuffle
            </Button>
          )}
        </Box>

        {results.weatherWarning && <Alert severity="warning">{results.weatherWarning}</Alert>}

        {top ? (
          <>
            <TopPickCard
              suggestion={top}
              rated={ratingStatus[top.activityId] === 'done'}
              onStart={() => setOpenActivityId(top.activityId)}
            />

            {others.length > 0 && (
              <Box>
                <Typography component="h2" sx={{ fontSize: 15, fontWeight: 800, mb: 1 }}>
                  Or try one of these
                </Typography>
                <Stack spacing={1}>
                  {others.map((s) => (
                    <AlternativeRow key={s.activityId} suggestion={s} onClick={() => promote(s.activityId)} />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        ) : (
          <NoResults nearMisses={results.nearMisses} onBack={() => setResults(null)} />
        )}

        <ActivityDialog
          open={openActivityId != null}
          activityId={openActivityId}
          onClose={() => setOpenActivityId(null)}
          childName={results.childName}
          ratingStatus={ratingStatus[openActivityId]}
          onRate={(rating) => handleRate(openActivityId, rating)}
        />
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.secondary' }}>
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </Typography>
        <Typography component="h1" sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: { xs: 28, sm: 36 }, fontWeight: 800, lineHeight: 1.1 }}>
          What should we do today?
        </Typography>
      </Box>

      <WeatherPill weather={weather} onSetLocation={openSettings} />

      <Stack spacing={1.25}>
        <SectionLabel>Who&rsquo;s playing?</SectionLabel>
        <ChildPicker
          childList={childList}
          selectedId={selectedChild?.id}
          onSelect={setSelectedChildId}
          onAdd={openAddChild}
        />
      </Stack>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <SectionLabel htmlFor="available-minutes">How much time?</SectionLabel>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'primary.main' }}>{formatMinutes(availableMinutes)}</Typography>
        </Box>
        <Box sx={{ px: 1 }}>
          <Slider
            slotProps={{ input: { id: 'available-minutes' } }}
            value={availableMinutes}
            onChange={(e, value) => setAvailableMinutes(value)}
            min={15}
            max={120}
            step={5}
            marks={TIME_MARKS}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}m`}
            sx={{ '& .MuiSlider-markLabel': { fontSize: 11, fontWeight: 700, color: 'text.secondary' } }}
          />
        </Box>
      </Box>

      <Stack spacing={1.25}>
        <SectionLabel>Where?</SectionLabel>
        <ChoiceTiles label="Where" options={WHERE_OPTIONS} value={locationType} onChange={setLocationType} />
      </Stack>

      <Stack spacing={1.25}>
        <SectionLabel>How messy?</SectionLabel>
        <ChoiceTiles label="How messy" options={MESS_OPTIONS} value={maxMessLevel} onChange={setMaxMessLevel} />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        variant="contained"
        size="large"
        onClick={handleSearch}
        disabled={searching || !selectedChild}
        sx={{ height: 56, fontSize: 20, borderRadius: '16px', boxShadow: 'none' }}
      >
        {searching ? 'Finding ideas…' : 'Jumble it!'}
      </Button>
    </Stack>
  )
}

function TopPickCard({ suggestion, rated, onStart }) {
  const { bg, fg } = softColorFor(suggestion.activityId)
  const [loaded, setLoaded] = useState(null)

  // Mess level and location aren't part of the suggestion itself, so the
  // card fetches the activity's detail to show them. Results are tagged
  // with the activity id, so a shuffle never shows the previous card's
  // details for a moment.
  useEffect(() => {
    let cancelled = false
    const id = suggestion.activityId
    getActivity(id)
      .then((data) => !cancelled && setLoaded({ id, data }))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [suggestion.activityId])

  const detail = loaded?.id === suggestion.activityId ? loaded.data : null

  return (
    <Card component="article" sx={{ overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', height: { xs: 128, sm: 160 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bg, color: fg }}>
        <ActivityIcon activityId={suggestion.activityId} size={56} strokeWidth={1.6} />
        <Box
          component="span"
          sx={{ position: 'absolute', top: 12, left: 12, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: 'background.paper', color: 'secondary.dark', fontSize: 12, fontWeight: 800 }}
        >
          Top pick
        </Box>
      </Box>
      <Stack spacing={1} sx={{ p: 2, pt: 1.75 }}>
        <Typography component="h2" sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: 25, fontWeight: 800, lineHeight: 1.1 }}>
          {suggestion.title}
        </Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip size="small" label={formatMinutes(suggestion.durationMinutes)} sx={{ bgcolor: '#F1F5F8' }} />
          {detail && <Chip size="small" label={MESS_LABELS[detail.messLevel]} sx={{ bgcolor: '#F1F5F8' }} />}
          {detail && <Chip size="small" label={LOCATION_LABELS[detail.locationType]} sx={{ bgcolor: '#F1F5F8' }} />}
        </Stack>
        <Typography sx={{ fontSize: 14, lineHeight: 1.45, color: 'text.secondary' }}>{suggestion.explanation}</Typography>
        {rated && (
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'success.dark' }}>Rated. Thanks!</Typography>
        )}
        <Button variant="contained" size="large" onClick={onStart} sx={{ mt: 0.5, height: 50, fontSize: 18, boxShadow: 'none' }}>
          Let&rsquo;s start
        </Button>
      </Stack>
    </Card>
  )
}

function AlternativeRow({ suggestion, onClick }) {
  const { bg, fg } = softColorFor(suggestion.activityId)
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        minHeight: 62,
        justifyContent: 'flex-start',
        gap: 1.5,
        pl: 1,
        pr: 1.5,
        py: 1,
        borderRadius: '16px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'left',
        '&:hover': { borderColor: '#A9BCCB' },
      }}
    >
      <Box sx={{ width: 46, height: 46, flexShrink: 0, borderRadius: '12px', bgcolor: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIcon activityId={suggestion.activityId} size={22} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{suggestion.title}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{formatMinutes(suggestion.durationMinutes)}</Typography>
      </Box>
      <Box component="span" sx={{ color: '#8A9AA8', display: 'flex' }}>
        <ChevronRightIcon size={18} strokeWidth={2.2} />
      </Box>
    </ButtonBase>
  )
}

function NoResults({ nearMisses, onBack }) {
  return (
    <Card>
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Nothing fits just right
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Try a bit more time, a messier setting, or a different place.
        </Typography>

        {nearMisses?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, mb: 1 }}>So close! These just need a couple of things:</Typography>
            <Stack spacing={1}>
              {nearMisses.map((nm) => (
                <Box key={nm.activityId} sx={{ p: 1.5, borderRadius: '12px', border: '1px dashed', borderColor: '#A9BCCB' }}>
                  <Typography sx={{ fontWeight: 800 }}>{nm.title}</Typography>
                  <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>Missing: {nm.missingMaterials.join(', ')}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Button variant="outlined" onClick={onBack}>
          Change my choices
        </Button>
      </Box>
    </Card>
  )
}
