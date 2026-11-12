import { ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { EmptyState } from './EmptyState'
import { Shimmer } from './Skeletons'

interface RequireAuthProps {
  children: ReactNode
  /** When true the route is limited to the seeded admin account. */
  admin?: boolean
}

/**
 * Route guard for the account area. Sends signed-out visitors to the login
 * page with a `next` target so they land back where they were headed.
 */
export const RequireAuth = ({ children, admin = false }: RequireAuthProps) => {
  const { isAuthenticated, isAdmin, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <div className="container-page py-24">
        <Shimmer className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (admin && !isAdmin) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={ShieldAlert}
          title="Studio access only"
          description="The admin dashboard is limited to the seeded CINÉVO Studio account. Sign out and use the admin demo credentials to look around."
          actionLabel="Back to the catalog"
          actionHref="/explore"
        />
      </div>
    )
  }

  return <>{children}</>
}
