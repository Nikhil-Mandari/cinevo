import type { Booking, ProfileUpdate, User } from '../types'
import { authService } from './authService'
import { bookingService } from './bookingService'
import { mockDelay } from './apiClient'
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage'
import { db, type StoredUser } from './db'

const toPublicUser = (stored: StoredUser): User => ({
  id: stored.id,
  name: stored.name,
  email: stored.email,
  phone: stored.phone,
  city: stored.city,
  role: stored.role,
  avatarTone: stored.avatarTone,
  favouriteGenres: stored.favouriteGenres,
  createdAt: stored.createdAt,
})

export const userService = {
  async updateProfile(current: User, patch: ProfileUpdate): Promise<User> {
    await mockDelay(280)
    const updated: User = { ...current, ...patch }
    const session = await authService.updateProfile(updated)
    return session.user
  },

  getWatchlist(): string[] {
    return readJSON<string[]>(STORAGE_KEYS.watchlist, [])
  },

  saveWatchlist(ids: string[]): string[] {
    writeJSON(STORAGE_KEYS.watchlist, ids)
    return ids
  },

  getSavedAlbums(): string[] {
    return readJSON<string[]>(STORAGE_KEYS.playlist, [])
  },

  saveAlbums(ids: string[]): string[] {
    writeJSON(STORAGE_KEYS.playlist, ids)
    return ids
  },

  async bookingHistory(userId: string): Promise<Booking[]> {
    return bookingService.listByUser(userId)
  },

  async stats(userId: string) {
    const bookings = await bookingService.listByUser(userId)
    const confirmed = bookings.filter((booking) => booking.status === 'confirmed')
    return {
      bookings: confirmed.length,
      upcoming: confirmed.filter((booking) => bookingService.isUpcoming(booking)).length,
      spent: confirmed.reduce((total, booking) => total + booking.total, 0),
      watchlist: this.getWatchlist().length,
    }
  },

  async lookupUser(userId: string): Promise<User | null> {
    await mockDelay(40)
    const stored = db.users().find((user) => user.id === userId)
    return stored ? toPublicUser(stored) : null
  },
}
