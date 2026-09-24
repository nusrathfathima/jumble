import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signup(form)
      navigate('/')
    } catch (err) {
      // ApiError carries the backend's actual message (e.g. "An account
      // with this email already exists", or a validation message like
      // "Password must be at least 8 characters"). Anything else — a
      // network failure, the backend being unreachable — gets a generic
      // fallback rather than an unhandled crash.
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        px: 2,
        py: { xs: 6, sm: 10 },
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create your account
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Start getting activity ideas tailored to your kids.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                id="displayName"
                label="Your name"
                type="text"
                fullWidth
                value={form.displayName}
                onChange={updateField('displayName')}
                autoComplete="name"
              />

              <TextField
                id="email"
                label="Email"
                type="email"
                required
                fullWidth
                value={form.email}
                onChange={updateField('email')}
                autoComplete="email"
              />

              <TextField
                id="password"
                label="Password"
                type="password"
                required
                fullWidth
                inputProps={{ minLength: 8 }}
                value={form.password}
                onChange={updateField('password')}
                autoComplete="new-password"
                helperText="At least 8 characters"
              />

              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                {submitting ? 'Creating account…' : 'Sign up'}
              </Button>
            </Stack>
          </Box>

          <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600}>
              Log in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
