import type { PriceBreakdown, Screen, Seat, SeatClass, Showtime } from '../types'

export const CONVENIENCE_FEE_PER_SEAT = 32
export const GST_RATE = 0.18
export const MAX_SEATS = 10

const CLASS_SURCHARGE: Record<SeatClass, number> = {
  classic: 0,
  premium: 90,
  recliner: 260,
}

export const seatPrice = (basePrice: number, seatClass: SeatClass): number =>
  Math.max(120, basePrice + CLASS_SURCHARGE[seatClass])

export const rowLabel = (index: number): string => {
  let label = ''
  let value = index
  do {
    label = String.fromCharCode(65 + (value % 26)) + label
    value = Math.floor(value / 26) - 1
  } while (value >= 0)
  return label
}

const hash = (value: string): number => {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Deterministic occupied seats per showtime. Gives every show a believable,
 * stable audience without a backend.
 */
export const buildSeatMap = (showtime: Showtime, screen: Screen): Seat[] => {
  const { rows, cols, premiumRows, reclinerRows } = screen.seatLayout
  const seats: Seat[] = []

  for (let r = 0; r < rows; r += 1) {
    const row = rowLabel(r)
    const seatClass: SeatClass = reclinerRows.includes(row)
      ? 'recliner'
      : premiumRows.includes(row)
        ? 'premium'
        : 'classic'

    for (let n = 1; n <= cols; n += 1) {
      const id = `${row}${n}`
      const sold = hash(`${showtime.id}:${id}`) % 100 < 26
      seats.push({
        id,
        row,
        number: n,
        seatClass,
        price: seatPrice(showtime.basePrice, seatClass),
        status: sold ? 'occupied' : 'available',
      })
    }
  }

  return seats
}

export const buildPriceBreakdown = (
  seats: Seat[],
  convenienceFee = CONVENIENCE_FEE_PER_SEAT,
): PriceBreakdown => {
  const ticketSubtotal = seats.reduce((total, seat) => total + seat.price, 0)
  const fees = seats.length * convenienceFee
  const gst = Math.round((ticketSubtotal + fees) * GST_RATE)
  return {
    ticketSubtotal,
    convenienceFee: fees,
    gst,
    total: ticketSubtotal + fees + gst,
    seatCount: seats.length,
  }
}

export const seatClassLabel = (seatClass: SeatClass): string => {
  if (seatClass === 'recliner') return 'Recliner'
  if (seatClass === 'premium') return 'Premium'
  return 'Classic'
}
