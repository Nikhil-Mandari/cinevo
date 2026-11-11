import type { Showtime } from '../types'
import { api, isMockMode, mockDelay } from './apiClient'
import { db } from './db'
import { createId } from '../utils/storage'
import { startOfToday, isoDate } from '../data/theatres'

export interface ShowtimeQuery {
  city?: string
  date?: string
  theatreId?: string
}

export const showtimeService = {
  async listByMovie(movieId: string, filters: ShowtimeQuery = {}): Promise<Showtime[]> {
    if (!isMockMode()) {
      return api.get<Showtime[]>(`/api/showtimes?movieId=${movieId}`)
    }
    await mockDelay(90)
    const theatres = db.theatres()
    return db
      .showtimes()
      .filter((showtime) => {
        if (showtime.movieId !== movieId) return false
        if (filters.date && showtime.date !== filters.date) return false
        if (filters.theatreId && showtime.theatreId !== filters.theatreId) return false
        if (filters.city) {
          const theatre = theatres.find((item) => item.id === showtime.theatreId)
          if (theatre?.city !== filters.city) return false
        }
        return true
      })
      .sort((a, b) => a.time.localeCompare(b.time))
  },

  async datesForMovie(movieId: string, city?: string): Promise<string[]> {
    const today = isoDate(startOfToday())
    const showtimes = await this.listByMovie(movieId, { city })
    return [...new Set(showtimes.map((showtime) => showtime.date))]
      .filter((date) => date >= today)
      .sort()
  },

  async getById(id: string): Promise<Showtime | null> {
    await mockDelay(60)
    return db.showtimes().find((showtime) => showtime.id === id) ?? null
  },

  async listAll(): Promise<Showtime[]> {
    await mockDelay(70)
    return db.showtimes()
  },

  async create(payload: Omit<Showtime, 'id'>): Promise<Showtime> {
    await mockDelay(100)
    const showtime: Showtime = { ...payload, id: createId('st') }
    db.saveShowtimes([...db.showtimes(), showtime])
    return showtime
  },

  async update(id: string, patch: Partial<Showtime>): Promise<Showtime> {
    await mockDelay(100)
    const next = db.showtimes().map((showtime) =>
      showtime.id === id ? { ...showtime, ...patch, id } : showtime,
    )
    db.saveShowtimes(next)
    return next.find((showtime) => showtime.id === id) as Showtime
  },

  async remove(id: string): Promise<void> {
    await mockDelay(80)
    db.saveShowtimes(db.showtimes().filter((showtime) => showtime.id !== id))
  },

  async regenerate(): Promise<Showtime[]> {
    await mockDelay(140)
    return db.regenerateShowtimes()
  },
}
