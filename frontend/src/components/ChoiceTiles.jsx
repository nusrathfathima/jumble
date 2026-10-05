import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'

/**
 * A row of big tappable tiles (icon + label) for picking one option —
 * used for "Where?" and "How messy?" instead of dropdowns. One tap, no
 * menu to open, and comfortable to hit with a thumb.
 *
 * options: [{ value, label, Icon }]
 */
export function ChoiceTiles({ label, options, value, onChange }) {
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 1.25 }}
    >
      {options.map(({ value: optionValue, label: optionLabel, Icon }) => {
        const selected = optionValue === value
        return (
          <ButtonBase
            key={optionValue}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            sx={{
              height: 64,
              flexDirection: 'column',
              gap: 0.5,
              borderRadius: '16px',
              boxSizing: 'border-box',
              bgcolor: selected ? 'primary.light' : 'background.paper',
              border: selected ? '2px solid' : '1.5px solid',
              borderColor: selected ? 'primary.main' : '#D5E2EC',
              color: selected ? 'primary.dark' : '#3E5060',
              transition: 'background-color 150ms ease, border-color 150ms ease',
              '&:hover': { borderColor: selected ? 'primary.main' : '#A9BCCB' },
              '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            <Icon size={24} />
            <Typography component="span" variant="body2" sx={{ fontWeight: selected ? 800 : 700 }}>
              {optionLabel}
            </Typography>
          </ButtonBase>
        )
      })}
    </Box>
  )
}
