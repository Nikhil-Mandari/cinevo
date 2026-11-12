import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'

interface WatchlistContextValue {
  ids: string[]
  isSaved: (movieId: string) => boolean
  toggle: (movieId: string) => boolean
  remove: (movieId: string) => void
  clear: () => void
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEYS.watchlist, [])

  const toggle = useCallback(
    (movieId: string) => {
      const exists = ids.includes(movieId)
      setIds(exists ? ids.filter((id) => id !== movieId) : [movieId, ...ids])
      return !exists
    },
    [ids, setIds],
  )

  const remove = useCallback(
    (movieId: string) => setIds(ids.filter((id) => id !== movieId)),
    [ids, setIds],
  )

  const clear = useCallback(() => setIds([]), [setIds])

  const value = useMemo<WatchlistContextValue>(
    () => ({ ids, isSaved: (id) => ids.includes(id), toggle, remove, clear }),
    [ids, toggle, remove, clear],
  )

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export const useWatchlist = (): WatchlistContextValue => {
  const context = useContext(WatchlistContext)
  if (!context) throw new Error('useWatchlist must be used inside WatchlistProvider')
  return context
}
