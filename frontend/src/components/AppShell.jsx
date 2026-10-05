import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { AppDataProvider, useAppData } from '../context/AppDataContext'
import { AddChildForm } from './AddChildForm'
import { BottomNav } from './BottomNav'
import { CloseIcon } from './Icons'
import { SettingsDialog } from './SettingsDialog'

/**
 * Everything a signed-in parent sees around the current tab: the tab
 * navigation, the page itself, and the two dialogs any tab can open
 * (Settings, and "Add a child").
 */
export function AppShell({ settingsOpen, onOpenSettings, onCloseSettings }) {
  return (
    <AppDataProvider onOpenSettings={onOpenSettings}>
      <ShellContent settingsOpen={settingsOpen} onCloseSettings={onCloseSettings} />
    </AppDataProvider>
  )
}

function ShellContent({ settingsOpen, onCloseSettings }) {
  const theme = useTheme()
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'))
  const { childList, tags, weather, reloadWeather, addChild, addChildOpen, closeAddChild } = useAppData()

  return (
    <>
      {!isPhone && <BottomNav />}

      <Container
        maxWidth="sm"
        component="main"
        // On phones the tab bar is fixed to the bottom, so leave room
        // for it under the last thing on the page.
        sx={{ pt: { xs: 2.5, sm: 3 }, pb: { xs: 12, sm: 6 } }}
      >
        <Outlet />
      </Container>

      {isPhone && <BottomNav />}

      <Dialog open={addChildOpen} onClose={closeAddChild} fullWidth maxWidth="xs" fullScreen={isPhone}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}>
          Add a child
          <IconButton onClick={closeAddChild} aria-label="Close" sx={{ color: 'text.secondary' }}>
            <CloseIcon size={22} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 0.5 }}>
            <AddChildForm tags={tags} onChildAdded={addChild} />
          </Box>
        </DialogContent>
      </Dialog>

      <SettingsDialog
        open={settingsOpen}
        onClose={onCloseSettings}
        childList={childList}
        tags={tags}
        locationSet={Boolean(weather?.locationSet)}
        onLocationChanged={reloadWeather}
      />
    </>
  )
}
