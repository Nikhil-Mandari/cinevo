import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets scroll on navigation, except when the URL targets an in-page anchor. */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
