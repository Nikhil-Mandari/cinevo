import type { Theatre } from '../types'
import { api, isMockMode, mockDelay } from './apiClient'
import { db } from './db'
import { createId } from '../utils/storage'

export const theatreService = {
  async list(city?: string): Promise<Theatre[]> {
    if (!isMockMode()) {
      return api.get<Theatre[]>(`/api/theatres${city ? `?city=${encodeURIComponent(city)}` : ''}`)
    }
    await mockDelay(100)
    const theatres = db.theatres()
    return city ? theatres.filter((theatre) => theatre.city === city) : theatres
  },

  async getById(id: string): Promise<Theatre | null> {
    await mockDelay(60)
    return db.theatres().find((theatre) => theatre.id === id) ?? null
  },

  async cities(): Promise<string[]> {
    await mockDelay(40)
    return [...new Set(db.theatres().map((theatre) => theatre.city))]
  },

  async create(payload: Omit<Theatre, 'id'>): Promise<Theatre> {
    await mockDelay(120)
    const theatre: Theatre = { ...payload, id: createId('th') }
    db.saveTheatres([...db.theatres(), theatre])
    return theatre
  },

  async update(id: string, patch: Partial<Theatre>): Promise<Theatre> {
    await mockDelay(120)
    const theatres = db.theatres().map((theatre) =>
      theatre.id === id ? { ...theatre, ...patch, id } : theatre,
    )
    db.saveTheatres(theatres)
    return theatres.find((theatre) => theatre.id === id) as Theatre
  },

  async remove(id: string): Promise<void> {
    await mockDelay(100)
    db.saveTheatres(db.theatres().filter((theatre) => theatre.id !== id))
    db.saveShowtimes(db.showtimes().filter((showtime) => showtime.theatreId !== id))
  },
}
