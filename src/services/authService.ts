import type { AuthCredentials, AuthSession, RegisterPayload, User } from '../types'
import { db, digestPassword, type StoredUser } from './db'
import { mockDelay, tokenStore } from './apiClient'
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage'

export const DEMO_CREDENTIALS = {
  user: { email: 'demo@cinevo.in', password: 'demo1234' },
  admin: { email: 'admin@cinevo.in', password: 'admin1234' },
}

const issueToken = (user: User): string => {
  const payload = { sub: user.id, email: user.email, role: user.role, iat: Date.now() }
  try {
    return `demo.${window.btoa(JSON.stringify(payload))}.signature`
  } catch {
    return `demo.${user.id}.signature`
  }
}

const toSession = (user: StoredUser): AuthSession => {
  const safeUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    role: user.role,
    avatarTone: user.avatarTone,
    favouriteGenres: user.favouriteGenres,
    createdAt: user.createdAt,
  }
  const session: AuthSession = {
    user: safeUser,
    token: issueToken(safeUser),
    issuedAt: new Date().toISOString(),
  }
  writeJSON(STORAGE_KEYS.session, session)
  tokenStore.set(session.token)
  return session
}

const normalise = (email: string) => email.trim().toLowerCase()

export const authService = {
  getSession(): AuthSession | null {
    const session = readJSON<AuthSession | null>(STORAGE_KEYS.session, null)
    if (!session?.user) return null
    return session
  },

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    await mockDelay(420)
    const email = normalise(credentials.email)
    const user = db.users().find((item) => item.email.toLowerCase() === email)
    if (!user) throw new Error('No CINÉVO account found for this email.')
    if (user.passwordDigest !== digestPassword(credentials.password)) {
      throw new Error('That password does not match our records.')
    }
    return toSession(user)
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    await mockDelay(520)
    const email = normalise(payload.email)
    if (!payload.name.trim()) throw new Error('Please tell us your name.')
    if (payload.password.length < 6) throw new Error('Use at least 6 characters for your password.')
    const users = db.users()
    if (users.some((user) => user.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists.')
    }
    const user: StoredUser = {
      id: `user-${Date.now().toString(36)}`,
      name: payload.name.trim(),
      email,
      phone: payload.phone?.trim() ?? '',
      city: 'Hyderabad',
      role: 'user',
      avatarTone: '#4b2c6b',
      favouriteGenres: [],
      createdAt: new Date().toISOString(),
      passwordDigest: digestPassword(payload.password),
    }
    db.saveUsers([...users, user])
    return toSession(user)
  },

  async forgotPassword(email: string): Promise<string> {
    await mockDelay(700)
    if (!email.includes('@')) throw new Error('Enter a valid email address.')
    return 'If this email is registered, a reset link would be sent. This is a frontend demo — no email is actually delivered.'
  },

  logout(): void {
    tokenStore.clear()
    try {
      window.localStorage.removeItem(STORAGE_KEYS.session)
    } catch {
      /* ignore */
    }
  },

  async updateProfile(user: User): Promise<AuthSession> {
    await mockDelay(300)
    const users = db.users()
    const next = users.map((item) =>
      item.id === user.id ? { ...item, ...user, passwordDigest: item.passwordDigest } : item,
    )
    db.saveUsers(next)
    const stored = next.find((item) => item.id === user.id)
    if (!stored) throw new Error('Profile could not be updated.')
    const session = toSession(stored)
    return session
  },
}
