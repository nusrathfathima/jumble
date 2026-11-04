import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { CheckIcon } from './Icons'

function Tick({ sx }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        width: 22,
        height: 22,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <CheckIcon size={13} strokeWidth={3.5} />
    </Box>
  )
}

/**
 * Big tappable choices for picking one option, used for "Where?" and
 * "How messy?". Each option's icon sits in its own coloured circle; the
 * picked one gets a green outline and a tick.
 *
 * variant "tiles" (default): a row of square tiles.
 * variant "list": a column of pill buttons, for narrow spaces.
 * large: bigger tiles, for the roomy step cards of the wide layout.
 *
 * options: [{ value, label, Icon, tone: { bg, fg } }]
 */
export function ChoiceTiles({ label, options, value, onChange, variant = 'tiles', large = false }) {
  const isList = variant === 'list'
  return (
    <Box
      role="radiogroup"
      aria-label={label}
      sx={
        isList
          ? { display: 'flex', flexDirection: 'column', gap: 1 }
          : { display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 1.25, pt: 0.75 }
      }
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
              boxSizing: 'border-box',
              bgcolor: selected ? '#F2FAF4' : 'background.paper',
              border: selected ? '2.5px solid' : '1.5px solid',
              borderColor: selected ? 'primary.main' : '#CFE0D4',
              color: selected ? 'primary.dark' : '#33503D',
              transition: 'background-color 150ms ease, border-color 150ms ease, transform 120ms ease',
              '&:hover': { borderColor: selected ? 'primary.main' : '#93AE9B' },
              '&:active': { transform: 'scale(0.97)' },
              '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              ...(isList
                ? { height: 52, justifyContent: 'flex-start', gap: 1.25, pl: 1, pr: 1.5, borderRadius: 999 }
                : { height: large ? 104 : 76, flexDirection: 'column', gap: large ? 1 : 0.75, borderRadius: large ? '24px' : '20px' }),
            }}
          >
            {selected && !isList && (
              <Tick sx={{ position: 'absolute', top: -8, right: -8, boxShadow: '0 0 0 3px #F3F8F4' }} />
            )}
            <Box
              component="span"
              sx={{ width: large ? 46 : 34, height: large ? 46 : 34, flexShrink: 0, borderRadius: '50%', bgcolor: tone.bg, color: tone.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon size={large ? 24 : 20} strokeWidth={2.2} />
            </Box>
            <Typography component="span" sx={{ fontSize: isList || large ? 15 : 13, fontWeight: 800 }}>
              {optionLabel}
            </Typography>
            {selected && isList && <Tick sx={{ ml: 'auto' }} />}
          </ButtonBase>
        )
      })}
    </Box>
  )
}
