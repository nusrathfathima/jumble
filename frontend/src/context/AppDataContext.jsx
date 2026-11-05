import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { listChildren } from '../api/children'
import { listTags } from '../api/tags'
import { getTodayWeather } from '../api/weather'

const AppDataContext = createContext(null)

/**
 * The signed-in family's shared data: children, interest tags and today's
 * weather. Loaded once when the parent signs in and shared by every page
 * (Today, Kids, History, Settings), so switching tabs never refetches
 * and never shows a spinner for data the app already has.
 *
 * It also remembers which child is selected, so picking Leo on Today and
 * then opening History shows Leo's history, not the first child's.
 */
export function AppDataProvider({ children: content, onOpenSettings }) {
  const [childList, setChildList] = useState([])
  const [tags, setTags] = useState([])
  const [weather, setWeather] = useState(null)
  // 'loading' | 'ready' | 'error'
  const [weatherStatus, setWeatherStatus] = useState('loading')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [addChildOpen, setAddChildOpen] = useState(false)

  // Weather is fetched separately from children and tags, so a slow or
  // failed weather lookup never holds up the rest of the app.
  const fetchWeather = useCallback(() => {
    getTodayWeather()
      .then((data) => {
        setWeather(data)
        setWeatherStatus('ready')
      })
      .catch(() => {
        setWeather(null)
        setWeatherStatus('error')
      })
  }, [])

  const loadWeather = useCallback(() => {
    setWeatherStatus('loading')
    fetchWeather()
  }, [fetchWeather])

  const fetchFamily = useCallback(() => {
    Promise.all([listChildren(), listTags()])
      .then(([childrenData, tagsData]) => {
        setChildList(childrenData)
        setTags(tagsData)
        setSelectedChildId((current) => current ?? childrenData[0]?.id ?? null)
        setLoadError(null)
      })
      // Shown as a "Try again" message instead of an empty page that
      // looks like the family has no children.
      .catch((err) => setLoadError(err?.message || 'Could not load your family.'))
      .finally(() => setLoading(false))
  }, [])

  const reloadFamily = useCallback(() => {
    setLoading(true)
    setLoadError(null)
    fetchFamily()
  }, [fetchFamily])

  useEffect(() => {
    fetchFamily()
    fetchWeather()
  }, [fetchFamily, fetchWeather])

  const addChild = useCallback((child) => {
    setChildList((prev) => [...prev, child])
    setSelectedChildId(child.id)
    setAddChildOpen(false)
  }, [])

  const value = {
    childList,
    tags,
    weather,
    weatherStatus,
    loading,
    loadError,
    reloadFamily,
    selectedChildId,
    setSelectedChildId,
    selectedChild: childList.find((c) => c.id === selectedChildId) ?? childList[0] ?? null,
    addChild,
    reloadWeather: loadWeather,
    addChildOpen,
    openAddChild: () => setAddChildOpen(true),
    closeAddChild: () => setAddChildOpen(false),
    openSettings: onOpenSettings,
  }

  return <AppDataContext.Provider value={value}>{content}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider')
  }
  return context
}
