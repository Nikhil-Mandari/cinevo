import type { Booking, BookingStatus } from '../types'
import { api, isMockMode, mockDelay } from './apiClient'
import { STORAGE_KEYS, readJSON, writeJSON } from '../utils/storage'

const readBookings = (): Booking[] => readJSON<Booking[]>(STORAGE_KEYS.bookings, [])
const writeBookings = (bookings: Booking[]): Booking[] => {
  writeJSON(STORAGE_KEYS.bookings, bookings)
  return bookings
}

const ticketId = (): string => {
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  const stamp = Date.now().toString(36).slice(-4).toUpperCase()
  return `CV${year}-${stamp}${random}`
}

export type BookingDraft = Omit<Booking, 'id' | 'createdAt' | 'status'>

export const bookingService = {
  async create(draft: BookingDraft): Promise<Booking> {
    if (!isMockMode()) return api.post<Booking>('/api/bookings', draft)
    await mockDelay(650)
    const booking: Booking = {
      ...draft,
      id: ticketId(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }
    writeBookings([booking, ...readBookings()])
    return booking
  },

  async listByUser(userId: string): Promise<Booking[]> {
    if (!isMockMode()) return api.get<Booking[]>(`/api/bookings?userId=${userId}`)
    await mockDelay(90)
    return readBookings()
      .filter((booking) => booking.userId === userId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  },

  async getById(id: string): Promise<Booking | null> {
    await mockDelay(60)
    return readBookings().find((booking) => booking.id === id) ?? null
  },

  async cancel(id: string): Promise<Booking | null> {
    if (!isMockMode()) return api.patch<Booking>(`/api/bookings/${id}/cancel`)
    await mockDelay(220)
    let updated: Booking | null = null
    const next = readBookings().map((booking) => {
      if (booking.id !== id) return booking
      updated = { ...booking, status: 'cancelled' as BookingStatus }
      return updated
    })
    writeBookings(next)
    return updated
  },

  async listAll(): Promise<Booking[]> {
    await mockDelay(90)
    return readBookings().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  },

  isUpcoming(booking: Booking): boolean {
    if (booking.status === 'cancelled') return false
    const showAt = new Date(`${booking.showDate}T${booking.showTime}:00`)
    return showAt.getTime() >= Date.now()
  },
}
