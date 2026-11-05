import { useState } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'
import { Sprout } from '../components/Garden'
import { LabeledField, PasswordField, emailError } from '../components/FormFields'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('expired') === '1'

  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const errors = {
    email: emailError(form.email),
    password: form.password ? null : 'Please enter your password.',
  }

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  function markTouched(field) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({ email: true, password: true })
    if (errors.email || errors.password) return

    setError(null)
    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate('/')
    } catch (err) {
      // The backend gives the same "Invalid email or password" message
      // whether the email doesn't exist or the password is wrong, so it
      // never reveals which emails have accounts.
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: { xs: 4, sm: 8 } }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Sprout size={76} waving watch />
          </Box>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Log in to see today&rsquo;s activity ideas.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.25}>
              {sessionExpired && !error && (
                <Alert severity="info">Your session ended, so please log in again.</Alert>
              )}
              {error && <Alert severity="error">{error}</Alert>}

              <LabeledField
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                onBlur={markTouched('email')}
                autoComplete="email"
                error={touched.email ? errors.email : null}
              />

              <PasswordField
                id="password"
                label="Password"
                value={form.password}
                onChange={updateField('password')}
                onBlur={markTouched('password')}
                autoComplete="current-password"
                error={touched.password ? errors.password : null}
              />

              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ height: 52, fontSize: 17 }}>
                {submitting ? 'Logging in…' : 'Log in'}
              </Button>
            </Stack>
          </Box>

          <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
            Don&rsquo;t have an account?{' '}
            <Link component={RouterLink} to="/signup" fontWeight={700}>
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
