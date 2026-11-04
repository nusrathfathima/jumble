import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { CheckIcon } from './Icons'

/**
 * A row of big tappable tiles for picking one option, used for "Where?"
 * and "How messy?". Each option's icon sits in its own coloured circle;
 * the picked tile gets a green outline and a little tick badge.
 *
 * options: [{ value, label, Icon, tone: { bg, fg } }]
 */
export function ChoiceTiles({ label, options, value, onChange }) {
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 1.25, pt: 0.75 }}
    >
      {options.map(({ value: optionValue, label: optionLabel, Icon, tone }) => {
        const selected = optionValue === value
        return (
          <ButtonBase
            key={optionValue}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            sx={{
              position: 'relative',
              height: 76,
              flexDirection: 'column',
              gap: 0.75,
              borderRadius: '20px',
              boxSizing: 'border-box',
              bgcolor: selected ? '#F2FAF4' : 'background.paper',
              border: selected ? '2.5px solid' : '1.5px solid',
              borderColor: selected ? 'primary.main' : '#CFE0D4',
              color: selected ? 'primary.dark' : '#33503D',
              transition: 'background-color 150ms ease, border-color 150ms ease, transform 120ms ease',
              '&:hover': { borderColor: selected ? 'primary.main' : '#93AE9B' },
              '&:active': { transform: 'scale(0.97)' },
              '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            {selected && (
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 3px #F3F8F4',
                }}
              >
                <CheckIcon size={13} strokeWidth={3.5} />
              </Box>
            )}
            <Box
              component="span"
              sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: tone.bg, color: tone.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon size={20} strokeWidth={2.2} />
            </Box>
            <Typography component="span" sx={{ fontSize: 13, fontWeight: 800 }}>
              {optionLabel}
            </Typography>
          </ButtonBase>
        )
      })}
    </Box>
  )
}
