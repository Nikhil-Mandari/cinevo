import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthCredentials, AuthSession, ProfileUpdate, RegisterPayload, User } from '../types'
import { authService } from '../services/authService'
import { userService } from '../services/userService'

interface AuthContextValue {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isAdmin: boolean
  isReady: boolean
  login: (credentials: AuthCredentials) => Promise<AuthSession>
  register: (payload: RegisterPayload) => Promise<AuthSession>
  logout: () => void
  updateProfile: (patch: ProfileUpdate) => Promise<User>
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setSession(authService.getSession())
    setIsReady(true)
  }, [])

  const login = useCallback(async (credentials: AuthCredentials) => {
    const next = await authService.login(credentials)
    setSession(next)
    return next
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const next = await authService.register(payload)
    setSession(next)
    return next
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: ProfileUpdate) => {
      if (!session) throw new Error('Sign in to update your profile.')
      const updated = await userService.updateProfile(session.user, patch)
      setSession((current) => (current ? { ...current, user: updated } : current))
      return updated
    },
    [session],
  )

  const refresh = useCallback(() => {
    setSession(authService.getSession())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session?.user),
      isAdmin: session?.user.role === 'admin',
      isReady,
      login,
      register,
      logout,
      updateProfile,
      refresh,
    }),
    [session, isReady, login, register, logout, updateProfile, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
