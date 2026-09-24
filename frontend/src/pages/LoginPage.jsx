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

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
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
      await login(form)
      navigate('/')
    } catch (err) {
      // AuthController deliberately returns the same "Invalid email or
      // password" message whether the email doesn't exist or the password
      // is wrong, so this doesn't need to distinguish those cases either.
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
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Log in to see today&rsquo;s activity suggestions.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}

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
                value={form.password}
                onChange={updateField('password')}
                autoComplete="current-password"
              />

              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
              </Button>
            </Stack>
          </Box>

          <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
            Don&rsquo;t have an account?{' '}
            <Link component={RouterLink} to="/signup" fontWeight={600}>
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
