import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { startLivingGarden } from './livingGarden'

/**
 * The moving garden behind every page: the garden along the bottom edges
 * and butterflies wandering anywhere on the page, behind the content.
 * Laptops and wider get the full garden; smaller screens get a single
 * butterfly. The drawing and animation live in livingGarden.js.
 */
export function LivingGarden() {
  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('lg'))
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current) return undefined
    return startLivingGarden(svgRef.current, { compact: !isWide })
  }, [isWide])

  return (
    <Box
      component="svg"
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      sx={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', display: 'block' }}
    />
  )
}
