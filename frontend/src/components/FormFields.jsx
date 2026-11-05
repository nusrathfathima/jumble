import { useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { EyeIcon, EyeOffIcon } from './Icons'

/**
 * A text field with its label in bold above the box, instead of the
 * small label MUI floats inside the box. The label is a real <label>
 * tied to the input, so screen readers still announce it.
 */
export function LabeledField({ id, label, error, helperText, optional, ...fieldProps }) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} sx={{ display: 'block', mb: 0.75, fontSize: 15, fontWeight: 800, color: 'text.primary' }}>
        {label}
        {optional && (
          <Box component="span" sx={{ ml: 0.75, fontWeight: 600, color: 'text.secondary' }}>
            (optional)
          </Box>
        )}
      </Typography>
      <TextField
        id={id}
        fullWidth
        error={Boolean(error)}
        helperText={error || helperText}
        {...fieldProps}
      />
    </Box>
  )
}

/** A password field with an eye button that shows or hides what was typed. */
export function PasswordField(props) {
  const [visible, setVisible] = useState(false)
  return (
    <LabeledField
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVisible((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                sx={{ color: 'text.secondary' }}
              >
                {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}

// A practical email check: something@something.something, no spaces.
// The backend checks again, so this is only for quick, friendly feedback.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function emailError(value) {
  if (!value.trim()) return 'Please enter your email.'
  if (!EMAIL_PATTERN.test(value.trim())) return 'That doesn’t look like an email address. Check for typos.'
  return null
}
