import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getStats } from '../api/stats'
import { listCompletions } from '../api/completions'
import { ApiError } from '../api/client'
import { useAppData } from '../context/AppDataContext'
import { softColorFor } from '../theme'
import { ChildPicker } from '../components/ChildPicker'
import { ActivityIcon } from '../components/Icons'

const RATING_STYLES = {
  LOVED: { label: 'Loved it', bg: '#FDE8F0', fg: '#B52A60' },
  OK: { label: 'Okay', bg: '#E4F2FB', fg: '#13527D' },
  SKIPPED: { label: 'Skipped', bg: '#F1F5F8', fg: '#3E5060' },
}

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

function StatTile({ value, label }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: 30, fontWeight: 800, lineHeight: 1, color: 'primary.main' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>{label}</Typography>
    </Box>
  )
}

/** The History tab: one child's numbers at a glance, then everything they've done. */
export function HistoryPage() {
  const { childList, loading, selectedChild, setSelectedChildId } = useAppData()
  // Tagged with the child it belongs to, so switching children never
  // shows the previous child's numbers for a moment.
  const [loaded, setLoaded] = useState(null)

  const childId = selectedChild?.id

  useEffect(() => {
    if (!childId) return
    let cancelled = false
    Promise.all([getStats(childId), listCompletions(childId)])
      .then(([stats, completions]) => !cancelled && setLoaded({ childId, stats, completions }))
      .catch(
        (err) =>
          !cancelled &&
          setLoaded({ childId, error: err instanceof ApiError ? err.message : 'Could not load the history.' }),
      )
    return () => {
      cancelled = true
    }
  }, [childId])

  const current = loaded?.childId === childId ? loaded : null
  const stats = current?.stats ?? null
  const completions = current?.completions ?? null
  const error = current?.error ?? null

  return (
    <Stack spacing={2.5}>
      <Typography component="h1" sx={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: 30, fontWeight: 800 }}>
        History
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : childList.length === 0 ? (
        <Typography color="text.secondary">Add a child first, then the activities you rate will show up here.</Typography>
      ) : (
        <>
          <ChildPicker childList={childList} selectedId={childId} onSelect={setSelectedChildId} />

          {error && <Alert severity="error">{error}</Alert>}

          {!error && (!stats || !completions) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={26} />
            </Box>
          )}

          {stats && completions && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.25 }}>
                <StatTile value={stats.completionsThisMonth} label="This month" />
                <StatTile value={stats.totalCompletions} label="All time" />
                <StatTile value={stats.lovedCount} label="Loved" />
              </Box>

              {stats.favoriteTag && (
                <Typography sx={{ fontSize: 15 }}>
                  {selectedChild.name}&rsquo;s favourite kind of activity:{' '}
                  <Box component="span" sx={{ fontWeight: 800, color: 'secondary.dark' }}>
                    {stats.favoriteTag.displayName}
                  </Box>
                </Typography>
              )}

              {completions.length === 0 ? (
                <Card>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Nothing here yet</Typography>
                    <Typography color="text.secondary">
                      Pick an idea on Today, try it, and rate it. It will show up here.
                    </Typography>
                  </Box>
                </Card>
              ) : (
                <Stack spacing={1}>
                  {completions.map((c) => {
                    const { bg, fg } = softColorFor(c.activityId)
                    const rating = RATING_STYLES[c.rating] ?? RATING_STYLES.OK
                    return (
                      <Box
                        key={c.id}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, pr: 1.5, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                      >
                        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '12px', bgcolor: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ActivityIcon activityId={c.activityId} size={21} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 800 }} noWrap>
                            {c.activityTitle}
                          </Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                            {dateFormat.format(new Date(c.completedAt))}
                          </Typography>
                        </Box>
                        <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: rating.bg, color: rating.fg, fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                          {rating.label}
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </>
          )}
        </>
      )}
    </Stack>
  )
}
