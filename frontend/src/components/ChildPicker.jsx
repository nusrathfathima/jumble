import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { softColorFor } from '../theme'
import { PlusIcon } from './Icons'

export function ChildAvatar({ child, size = 56, selected = false }) {
  const { bg, fg } = softColorFor(child.id)
  return (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        boxSizing: 'border-box',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bg,
        color: fg,
        border: '3px solid',
        borderColor: selected ? fg : 'transparent',
        fontFamily: '"Baloo 2", system-ui, sans-serif',
        fontSize: size * 0.43,
        fontWeight: 800,
        lineHeight: 1,
        transition: 'border-color 150ms ease, transform 150ms ease',
      }}
    >
      {child.name.trim().charAt(0).toUpperCase()}
    </Box>
  )
}

/**
 * "Who's playing?" — each child as a tappable avatar instead of a
 * dropdown. Scrolls sideways if a family has more children than fit.
 */
export function ChildPicker({ childList, selectedId, onSelect, onAdd }) {
  return (
    <Box
      role="radiogroup"
      aria-label="Who's playing"
      sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 0.5, mx: -0.5, px: 0.5 }}
    >
      {childList.map((child) => {
        const selected = child.id === selectedId
        return (
          <ButtonBase
            key={child.id}
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(child.id)}
            sx={{
              flexDirection: 'column',
              gap: 0.5,
              borderRadius: '12px',
              p: 0.25,
              '&:hover > span:first-of-type': { transform: 'scale(1.05)' },
            }}
          >
            <ChildAvatar child={child} selected={selected} />
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: selected ? 800 : 600, color: selected ? 'text.primary' : 'text.secondary', maxWidth: 72 }}
              noWrap
            >
              {child.name}
            </Typography>
          </ButtonBase>
        )
      })}

      {onAdd && (
        <ButtonBase
          onClick={onAdd}
          aria-label="Add a child"
          sx={{ flexDirection: 'column', gap: 0.5, borderRadius: '12px', p: 0.25 }}
        >
          <Box
            component="span"
            sx={{
              width: 56,
              height: 56,
              boxSizing: 'border-box',
              borderRadius: '50%',
              border: '2px dashed',
              borderColor: '#A9BCCB',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon size={22} />
          </Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Add
          </Typography>
        </ButtonBase>
      )}
    </Box>
  )
}
