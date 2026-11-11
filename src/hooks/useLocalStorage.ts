import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'

/** Typed localStorage state with cross-tab sync. */
export const useLocalStorage = <T>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => readJSON(key, initial))

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (current: T) => T)(current) : next
        writeJSON(key, resolved)
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setValue(JSON.parse(event.newValue) as T)
        } catch {
          /* ignore malformed cross-tab value */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, update] as const
}
