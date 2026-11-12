import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { CITIES } from '../data/theatres'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'

interface LocationContextValue {
  city: string
  cities: readonly string[]
  setCity: (city: string) => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [storedCity, setStoredCity] = useLocalStorage<string>(STORAGE_KEYS.location, 'Hyderabad')
  const city = CITIES.includes(storedCity as (typeof CITIES)[number]) ? storedCity : 'Hyderabad'

  const value = useMemo<LocationContextValue>(
    () => ({ city, cities: CITIES, setCity: setStoredCity }),
    [city, setStoredCity],
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext)
  if (!context) throw new Error('useLocation must be used inside LocationProvider')
  return context
}
