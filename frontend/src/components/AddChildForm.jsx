import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import { createChild } from '../api/children'
import { ApiError } from '../api/client'
import { colorForTag } from '../theme'

const currentYear = new Date().getFullYear()
// A reasonable birth-year range for the app's target ages (2-12 per the
// spec) plus a little slack on either side, rather than every year since
// 1900.
const birthYears = Array.from({ length: 15 }, (_, i) => currentYear - i)
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function AddChildForm({ tags, onChildAdded }) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState(currentYear - 5)
  const [birthMonth, setBirthMonth] = useState(1)
  const [selectedTags, setSelectedTags] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleTag(slug) {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const child = await createChild({
        name,
        birthYear: Number(birthYear),
        birthMonth: Number(birthMonth),
        interestTagSlugs: selectedTags,
      })
      setName('')
      setSelectedTags([])
      onChildAdded(child)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          id="childName"
          label="Name"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            id="birthMonth"
            label="Birth month"
            select
            fullWidth
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
          >
            {months.map((label, i) => (
              <MenuItem key={label} value={i + 1}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="birthYear"
            label="Birth year"
            select
            fullWidth
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          >
            {birthYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Interests (optional — helps tailor early suggestions)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag) => {
              const tagColor = colorForTag(tag.slug)
              const selected = selectedTags.includes(tag.slug)
              return (
                <Chip
                  key={tag.slug}
                  label={tag.displayName}
                  clickable
                  onClick={() => toggleTag(tag.slug)}
                  variant={selected ? 'filled' : 'outlined'}
                  sx={selected
                    ? { bgcolor: tagColor, color: '#FFFFFF', fontWeight: 600, borderColor: tagColor }
                    : { borderColor: tagColor, color: tagColor, fontWeight: 600 }}
                />
              )
            })}
          </Box>
        </Box>

        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add child'}
        </Button>
      </Stack>
    </Box>
  )
}
