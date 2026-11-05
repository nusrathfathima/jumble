import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
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

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [touched, setTouched] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const errors = {
    email: emailError(form.email),
    password: !form.password
      ? 'Please choose a password.'
      : form.password.length < 8
        ? 'Use at least 8 characters.'
        : null,
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
      await signup({ ...form, email: form.email.trim(), displayName: form.displayName.trim() })
      navigate('/')
    } catch (err) {
      // The backend's own message, e.g. "An account with this email
      // already exists"; anything unexpected gets a friendly fallback.
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
            Create your account
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Start getting activity ideas made for your kids.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.25}>
              {error && <Alert severity="error">{error}</Alert>}

              <LabeledField
                id="displayName"
                label="Your name"
                optional
                value={form.displayName}
                onChange={updateField('displayName')}
                autoComplete="name"
              />

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
                autoComplete="new-password"
                error={touched.password ? errors.password : null}
                helperText="At least 8 characters"
              />

              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ height: 52, fontSize: 17 }}>
                {submitting ? 'Creating account…' : 'Sign up'}
              </Button>
            </Stack>
          </Box>

          <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={700}>
              Log in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
