import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { getSuggestions } from '../api/suggestions'
import { recordCompletion } from '../api/completions'
import { getActivity } from '../api/activities'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'
import { BUTTER, GREEN_DARK, HEADING_FONT, MINT, PEACH, SKY, softColorFor } from '../theme'
import { Sprout, TopPickScene } from '../components/Garden'
import { ChildPicker } from '../components/ChildPicker'
import { ChoiceTiles } from '../components/ChoiceTiles'
import { WeatherPill } from '../components/WeatherPill'
import { ActivityDialog } from '../components/ActivityDialog'
import { LOCATION_LABELS, MESS_LABELS, formatMinutes } from '../components/activityLabels'
import {
  ActivityIcon,
  BackIcon,
  CheckIcon,
  DiceIcon,
  DropIcon,
  LockIcon,
  EitherIcon,
  HouseIcon,
  SplatIcon,
  TidyIcon,
  TreeIcon,
} from '../components/Icons'

const TIME_OPTIONS = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
]

// The four steps, in order. Each one stays blurred and locked until the
// one before it has an answer.
const STEP_HINTS = ['', 'Pick who’s playing first', 'Pick how much time first', 'Pick where first']

const WHERE_OPTIONS = [
  { value: 'INDOOR', label: 'Inside', Icon: HouseIcon, tone: PEACH },
  { value: 'OUTDOOR', label: 'Outside', Icon: TreeIcon, tone: MINT },
  { value: 'EITHER', label: 'Either', Icon: EitherIcon, tone: SKY },
]

const MESS_OPTIONS = [
  { value: 1, label: 'Tidy', Icon: TidyIcon, tone: SKY },
  { value: 2, label: 'A little', Icon: DropIcon, tone: BUTTER },
  { value: 3, label: 'Go wild', Icon: SplatIcon, tone: PEACH },
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// The chunky green button with a darker "3D" edge underneath, which
// sinks a little when pressed.
const PRESSABLE = {
  borderRadius: 999,
  fontFamily: HEADING_FONT,
  fontWeight: 800,
  boxShadow: `0 5px 0 ${GREEN_DARK}`,
  '&:hover': { boxShadow: `0 5px 0 ${GREEN_DARK}` },
  '&:active': { boxShadow: `0 2px 0 ${GREEN_DARK}`, transform: 'translateY(3px)' },
  '&.Mui-disabled': { boxShadow: 'none' },
}

/**
 * The Today tab: the "what should we do?" form, and once you press
 * "Jumble it!", the ideas for that child — one top pick plus a short list
 * of alternatives. Both views live on this one page, so the back arrow
 * returns to the form with every choice still in place.
 */
export function TodayPage() {
  const { parent } = useAuth()
  const { childList, loading, weather, setSelectedChildId, openAddChild, openSettings } = useAppData()

  // Nothing is preselected: every step starts empty, and each one
  // unlocks once the step before it has an answer.
  const [childId, setChildId] = useState(null)
  const [availableMinutes, setAvailableMinutes] = useState(null)
  const [locationType, setLocationType] = useState(null)
  const [maxMessLevel, setMaxMessLevel] = useState(null)
  const chosenChild = childList.find((c) => c.id === childId) ?? null

  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  // Keyed by activityId: 'submitting', 'done', or an error message.
  const [ratingStatus, setRatingStatus] = useState({})
  const [openActivityId, setOpenActivityId] = useState(null)

  // Laptops and wider get the "board game" layout: four numbered step
  // cards in a row. Smaller screens keep the stacked form.
  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('lg'))

  const firstName = (parent?.displayName || '').trim().split(' ')[0]

  const done = [childId != null, availableMinutes != null, locationType != null, maxMessLevel != null]
  const unlocked = [true, done[0], done[0] && done[1], done[0] && done[1] && done[2]]
  const nextStep = done.indexOf(false)
  const allDone = nextStep === -1

  // On narrower screens the steps are stacked, so after each answer the
  // next step is scrolled into view.
  function revealStep(n) {
    if (isWide) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => {
      document.getElementById(`today-step-${n}`)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    }, 150)
  }

  function pickChild(id) {
    setChildId(id)
    // Keeps History on the same child.
    setSelectedChildId(id)
    revealStep(2)
  }

  function pickTime(value) {
    setAvailableMinutes(value)
    revealStep(3)
  }

  function pickWhere(value) {
    setLocationType(value)
    revealStep(4)
  }

  const selectedChild = chosenChild

  async function handleSearch() {
    if (!selectedChild || !allDone) return
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Sprout size={84} waving />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Let&rsquo;s meet your little one
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Ideas are picked for each child&rsquo;s age and interests, so add a child to get started.
          </Typography>
          <Button variant="contained" size="large" onClick={openAddChild} sx={PRESSABLE}>
            Add a child
          </Button>
        </Box>
      </Card>
    )
  }

  if (results) {
    const [top, ...others] = results.suggestions
    return (
      <Stack spacing={2} sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <IconButton onClick={() => setResults(null)} aria-label="Back to the form" sx={{ ml: -1, color: 'text.primary' }}>
              <BackIcon size={22} strokeWidth={2.5} />
            </IconButton>
            <Typography component="h1" sx={{ fontFamily: HEADING_FONT, fontSize: { xs: 22, sm: 26, lg: 34 }, fontWeight: 800, lineHeight: 1.15 }}>
              Ideas for {results.childName}
            </Typography>
          </Box>
          {results.suggestions.length > 1 && (
            <Button
              variant="outlined"
              size="small"
              onClick={shuffle}
              startIcon={<DiceIcon size={16} strokeWidth={2.2} />}
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
                <Typography component="h2" sx={{ fontFamily: HEADING_FONT, fontSize: 17, fontWeight: 800, mb: 1 }}>
                  Or try one of these
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                  {others.map((s) => (
                    <AlternativeRow key={s.activityId} suggestion={s} onClick={() => promote(s.activityId)} />
                  ))}
                </Box>
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

  const steps = [
    {
      title: 'Who’s playing?',
      tone: PEACH,
      body: (
        <ChildPicker
          childList={childList}
          selectedId={childId}
          onSelect={pickChild}
          onAdd={openAddChild}
          center={isWide}
        />
      ),
    },
    {
      title: 'How much time?',
      tone: BUTTER,
      body: <TimeChoices value={availableMinutes} onChange={pickTime} columns={isWide ? 2 : 3} />,
    },
    {
      title: 'Where?',
      tone: SKY,
      body: (
        <ChoiceTiles
          label="Where"
          options={WHERE_OPTIONS}
          value={locationType}
          onChange={pickWhere}
          variant={isWide ? 'list' : 'tiles'}
        />
      ),
    },
    {
      title: 'How messy?',
      tone: MINT,
      body: (
        <ChoiceTiles
          label="How messy"
          options={MESS_OPTIONS}
          value={maxMessLevel}
          onChange={setMaxMessLevel}
          variant={isWide ? 'list' : 'tiles'}
        />
      ),
    },
  ].map((step, i) => (
    <Step
      key={step.title}
      id={`today-step-${i + 1}`}
      n={i + 1}
      title={step.title}
      tone={step.tone}
      wide={isWide}
      locked={!unlocked[i]}
      active={i === nextStep}
      done={done[i]}
      hint={STEP_HINTS[i]}
    >
      {step.body}
    </Step>
  ))

  const jumbleButton = (
    <Button
      fullWidth={!isWide}
      variant="contained"
      size="large"
      onClick={handleSearch}
      disabled={searching || !allDone}
      startIcon={searching ? null : <DiceIcon size={isWide ? 26 : 24} strokeWidth={2.2} />}
      sx={isWide ? { ...PRESSABLE, width: 440, height: 64, fontSize: 24, mt: 1 } : { ...PRESSABLE, height: 56, fontSize: 21, mt: 1, mb: 0.75 }}
    >
      {searching ? 'Finding ideas…' : 'Jumble it!'}
    </Button>
  )

  const notReadyHint = !allDone && (
    <Typography sx={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>
      Answer all four steps to jumble up some ideas.
    </Typography>
  )

  if (isWide) {
    return (
      <Stack spacing={3} sx={{ alignItems: 'center', pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.secondary' }}>
              {greeting()}
              {firstName ? `, ${firstName}` : ''}
            </Typography>
            <Typography component="h1" sx={{ fontFamily: HEADING_FONT, fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
              What should we do today?
            </Typography>
          </Box>
          <Sprout size={84} waving />
        </Box>

        <Box sx={{ width: 640 }}>
          <WeatherPill weather={weather} onSetLocation={openSettings} />
        </Box>

        <Box sx={{ position: 'relative', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 2.5, pt: 3 }}>
          {/* The dotted "board game" path joining the four steps. */}
          <Box
            aria-hidden="true"
            sx={{ position: 'absolute', top: 24, left: '12%', right: '12%', borderTop: '3px dotted #B9CDBF' }}
          />
          {steps}
        </Box>

        {error && <Alert severity="error" sx={{ width: 640 }}>{error}</Alert>}

        {jumbleButton}
        {notReadyHint}
      </Stack>
    )
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.secondary' }}>
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </Typography>
          <Typography component="h1" sx={{ fontFamily: HEADING_FONT, fontSize: { xs: 27, sm: 36 }, fontWeight: 800, lineHeight: 1.15 }}>
            What should we do today?
          </Typography>
        </Box>
        <Sprout size={72} waving />
      </Box>

      <WeatherPill weather={weather} onSetLocation={openSettings} />

      {steps}

      {error && <Alert severity="error">{error}</Alert>}

      {/* Once all four steps are answered, the button sticks just above
          the phone tab bar, so it's one tap away without scrolling. Before
          that it stays in place, so it never covers a step. */}
      <Box sx={{ position: { xs: allDone ? 'sticky' : 'static', sm: 'static' }, bottom: { xs: 80 }, zIndex: 2 }}>
        {jumbleButton}
      </Box>
      {notReadyHint}
    </Stack>
  )
}

/** Six big time buttons. Nothing is picked until you tap one. */
function TimeChoices({ value, onChange, columns }) {
  return (
    <Box role="radiogroup" aria-label="How much time" sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 1 }}>
      {TIME_OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <ButtonBase
            key={option.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            sx={{
              height: 48,
              borderRadius: 999,
              boxSizing: 'border-box',
              fontFamily: HEADING_FONT,
              fontSize: 17,
              fontWeight: 800,
              bgcolor: selected ? 'primary.main' : 'background.paper',
              color: selected ? '#FFFFFF' : BUTTER.fg,
              border: '1.5px solid',
              borderColor: selected ? 'primary.main' : '#E8D9A0',
              boxShadow: selected ? `0 3px 0 ${GREEN_DARK}` : 'none',
              transition: 'background-color 150ms ease, color 150ms ease',
              '&:hover': { borderColor: 'primary.main' },
              '&:active': { transform: 'scale(0.97)' },
              '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            {option.label}
          </ButtonBase>
        )
      })}
    </Box>
  )
}

/**
 * One numbered step. Locked steps are softly blurred, can't be clicked or
 * tabbed into, and show a small lock with a hint saying what to do first.
 * The step waiting for an answer glows green; answered steps get a tick
 * in their number badge.
 */
function Step({ id, n, title, tone, wide, locked, active, done, hint, children }) {
  const badge = (
    <Box
      aria-hidden="true"
      sx={{
        width: wide ? 44 : 32,
        height: wide ? 44 : 32,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: done ? 'primary.main' : tone.bg,
        color: done ? '#FFFFFF' : tone.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: HEADING_FONT,
        fontSize: wide ? 22 : 17,
        fontWeight: 800,
        transition: 'background-color 200ms ease',
        ...(wide ? { position: 'absolute', top: -22, left: '50%', ml: '-22px', boxShadow: '0 0 0 5px #F3F8F4' } : {}),
      }}
    >
      {done ? <CheckIcon size={wide ? 22 : 17} strokeWidth={3.2} /> : n}
    </Box>
  )

  const content = (
    <Box
      inert={locked}
      sx={{
        transition: 'filter 300ms ease, opacity 300ms ease',
        ...(locked ? { filter: 'blur(3px)', opacity: 0.45, pointerEvents: 'none', userSelect: 'none' } : {}),
      }}
    >
      {children}
    </Box>
  )

  const lockNote = locked && (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        top: wide ? '58%' : '62%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 12px rgba(22, 48, 31, 0.10)',
        color: 'text.secondary',
        fontSize: 13,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        zIndex: 1,
      }}
    >
      <LockIcon size={15} strokeWidth={2.4} />
      {hint}
    </Box>
  )

  const glow = active
    ? { borderColor: 'primary.main', boxShadow: '0 0 0 4px rgba(47, 125, 79, 0.15), 0 10px 24px rgba(47, 125, 79, 0.12)' }
    : {}

  if (wide) {
    return (
      <Card
        id={id}
        component="section"
        aria-label={`Step ${n}: ${title}`}
        sx={{ position: 'relative', overflow: 'visible', display: 'flex', flexDirection: 'column', gap: 1.5, px: 2.25, pt: 4, pb: 2.5, transition: 'box-shadow 300ms ease, border-color 300ms ease', ...glow }}
      >
        {badge}
        <Typography component="h2" sx={{ m: 0, textAlign: 'center', fontFamily: HEADING_FONT, fontSize: 20, fontWeight: 800, opacity: locked ? 0.6 : 1 }}>
          {title}
        </Typography>
        {content}
        {lockNote}
      </Card>
    )
  }

  return (
    <Box
      id={id}
      component="section"
      aria-label={`Step ${n}: ${title}`}
      sx={{
        position: 'relative',
        p: 2,
        borderRadius: '22px',
        border: '1.5px solid',
        borderColor: 'transparent',
        transition: 'box-shadow 300ms ease, border-color 300ms ease, background-color 300ms ease',
        ...(active ? { bgcolor: 'rgba(255, 255, 255, 0.7)', ...glow } : {}),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25, opacity: locked ? 0.6 : 1 }}>
        {badge}
        <Typography component="h2" sx={{ m: 0, fontFamily: HEADING_FONT, fontSize: 18, fontWeight: 800 }}>
          {title}
        </Typography>
      </Box>
      {content}
      {lockNote}
    </Box>
  )
}

function TopPickCard({ suggestion, rated, onStart }) {
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
      <Box sx={{ position: 'relative', height: { xs: 138, sm: 168, lg: 250 }, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN_DARK }}>
        <TopPickScene />
        <Box sx={{ position: 'relative', transform: 'translate(36px, -14px) rotate(-8deg)' }}>
          <ActivityIcon activityId={suggestion.activityId} size={58} strokeWidth={1.7} />
        </Box>
        <Box sx={{ position: 'absolute', left: 10, bottom: 4, display: 'flex', alignItems: 'flex-end', gap: 0.25 }}>
          <Sprout size={56} />
          <Box
            component="span"
            sx={{
              mb: 3.75,
              px: 1.5,
              py: 0.75,
              borderRadius: '16px 16px 16px 4px',
              bgcolor: 'background.paper',
              color: 'primary.dark',
              fontFamily: HEADING_FONT,
              fontSize: 14,
              fontWeight: 800,
              boxShadow: '0 3px 10px rgba(22, 48, 31, 0.10)',
            }}
          >
            My top pick!
          </Box>
        </Box>
      </Box>
      <Stack spacing={1} sx={{ p: 2, pt: 1.5 }}>
        <Typography component="h2" sx={{ fontFamily: HEADING_FONT, fontSize: 25, fontWeight: 800, lineHeight: 1.1 }}>
          {suggestion.title}
        </Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip size="small" label={formatMinutes(suggestion.durationMinutes)} sx={{ bgcolor: BUTTER.bg, color: BUTTER.fg }} />
          {detail && <Chip size="small" label={MESS_LABELS[detail.messLevel]} sx={{ bgcolor: MINT.bg, color: MINT.fg }} />}
          {detail && <Chip size="small" label={LOCATION_LABELS[detail.locationType]} sx={{ bgcolor: PEACH.bg, color: PEACH.fg }} />}
        </Stack>
        <Typography sx={{ fontSize: 14, lineHeight: 1.45, color: 'text.secondary' }}>{suggestion.explanation}</Typography>
        {rated && (
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'success.dark' }}>Rated. Thanks!</Typography>
        )}
        <Button variant="contained" size="large" onClick={onStart} sx={{ ...PRESSABLE, mt: 0.5, mb: 0.75, height: 52, fontSize: 19 }}>
          Let&rsquo;s start!
        </Button>
      </Stack>
    </Card>
  )
}

function AlternativeRow({ suggestion, onClick }) {
  const tone = softColorFor(suggestion.activityId)
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
        borderRadius: '20px',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'left',
        '&:hover': { borderColor: '#93AE9B' },
      }}
    >
      <Box sx={{ width: 46, height: 46, flexShrink: 0, borderRadius: '50%', bgcolor: tone.bg, color: tone.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIcon activityId={suggestion.activityId} size={22} strokeWidth={2.2} />
      </Box>
      <Typography sx={{ flex: 1, minWidth: 0, fontFamily: HEADING_FONT, fontSize: 16, fontWeight: 800 }}>{suggestion.title}</Typography>
      <Box component="span" sx={{ flexShrink: 0, px: 1.1, py: 0.25, borderRadius: 999, bgcolor: tone.bg, color: tone.fg, fontSize: 12, fontWeight: 800 }}>
        {formatMinutes(suggestion.durationMinutes)}
      </Box>
    </ButtonBase>
  )
}

function NoResults({ nearMisses, onBack }) {
  return (
    <Card>
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Sprout size={60} style={{ marginBottom: 8 }} />
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
                <Box key={nm.activityId} sx={{ p: 1.5, borderRadius: '12px', border: '1px dashed', borderColor: '#93AE9B', bgcolor: 'background.paper' }}>
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
