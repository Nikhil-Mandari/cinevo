import { ReceiptText } from 'lucide-react'
import type { PriceBreakdown, Seat } from '../../types'
import { cn } from '../../utils/cn'
import { inr } from '../../utils/format'
import { seatClassLabel } from '../../utils/seats'

interface OrderSummaryProps {
  seats: Seat[]
  breakdown: PriceBreakdown
  className?: string
}

interface Group {
  key: string
  label: string
  count: number
  unit: number
}

const groupSeats = (seats: Seat[]): Group[] => {
  const groups = new Map<string, Group>()
  seats.forEach((seat) => {
    const key = seat.seatClass
    const existing = groups.get(key)
    if (existing) {
      existing.count += 1
    } else {
      groups.set(key, { key, label: seatClassLabel(seat.seatClass), count: 1, unit: seat.price })
    }
  })
  return [...groups.values()]
}

export const OrderSummary = ({ seats, breakdown, className }: OrderSummaryProps) => {
  const groups = groupSeats(seats)

  return (
    <aside className={cn('surface p-5', className)}>
      <p className="eyebrow mb-4 flex items-center gap-1.5">
        <ReceiptText size={11} className="text-accent" /> Order summary
      </p>

      {seats.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted">
          Pick your seats to see the price breakdown.
        </p>
      ) : (
        <>
          <div className="space-y-2.5">
            {groups.map((group) => (
              <div key={group.key} className="flex items-center justify-between text-xs">
                <span className="text-white/70">
                  {group.label} <span className="text-muted">× {group.count}</span>
                </span>
                <span className="tabular-nums text-white">{inr(group.unit * group.count)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
            {seats.map((seat) => (
              <span key={seat.id} className="rounded-md border border-white/15 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-white/80">
                {seat.id}
              </span>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted">Tickets ({breakdown.seatCount})</dt>
              <dd className="tabular-nums text-white/80">{inr(breakdown.ticketSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Convenience fee</dt>
              <dd className="tabular-nums text-white/80">{inr(breakdown.convenienceFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">GST (18%)</dt>
              <dd className="tabular-nums text-white/80">{inr(breakdown.gst)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/50">Amount payable</span>
            <span className="font-display text-2xl leading-none text-white">{inr(breakdown.total)}</span>
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-white/25">
            Demo pricing. UPI is a scannable reference QR, but this app does not verify payment or issue a real ticket.
          </p>
        </>
      )}
    </aside>
  )
}
