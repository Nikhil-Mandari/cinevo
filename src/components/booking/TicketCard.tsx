import { CalendarDays, Clock3, MapPin, Ticket } from 'lucide-react'
import type { Booking } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, inr, showtimeLabel, toneGradient } from '../../utils/format'
import { MockQRCode } from './MockQRCode'

interface TicketCardProps {
  booking: Booking
  className?: string
}

export const TicketCard = ({ booking, className }: TicketCardProps) => {
  const cancelled = booking.status === 'cancelled'

  return (
    <article className={cn('relative overflow-hidden rounded-2xl border border-white/12 bg-ink-900', className)}>
      <div
        className="relative overflow-hidden px-5 pb-5 pt-5 sm:px-7 sm:pt-6"
        style={{ background: toneGradient(booking.posterTone, 160) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.25),rgba(8,8,8,0.88))]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60">
              <Ticket size={11} /> CINÉVO e-ticket
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.6rem,4vw,2.4rem)] uppercase leading-none tracking-wide text-white">
              {booking.movieTitle}
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/65">
              <MapPin size={11} /> {booking.theatreName}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em]',
              cancelled
                ? 'border-white/20 bg-black/30 text-white/60'
                : 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100',
            )}
          >
            {cancelled ? 'Cancelled' : 'Confirmed'}
          </span>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: CalendarDays, label: 'Date', value: formatDate(booking.showDate, { weekday: 'short', day: 'numeric', month: 'short' }) },
            { icon: Clock3, label: 'Time', value: showtimeLabel(booking.showTime) },
            { icon: Ticket, label: 'Screen', value: booking.screenName },
            { icon: Ticket, label: 'Seats', value: `${booking.seats.length} · ${booking.seatClasses[0] ?? 'classic'}` },
          ].map((item) => (
            <div key={item.label}>
              <p className="flex items-center gap-1 text-[8px] uppercase tracking-[0.16em] text-white/40">
                <item.icon size={9} /> {item.label}
              </p>
              <p className="mt-1 truncate text-[11px] font-medium capitalize text-white/90">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-y border-dashed border-white/15 px-5 py-4 sm:px-7">
        <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-white/10 bg-ink-950" />
        <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border border-white/10 bg-ink-950" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[8px] uppercase tracking-[0.18em] text-white/35">Seats</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {booking.seats.map((seat, index) => (
                <span key={seat} className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/85">
                  {seat}
                  <span className="ml-1 text-[7px] uppercase text-white/35">{booking.seatClasses[index]}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.18em] text-white/35">Paid</p>
            <p className="mt-1 font-display text-2xl leading-none text-white">{inr(booking.total)}</p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-white/30">{booking.paymentMethod} · demo</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="text-center sm:text-left">
          <p className="text-[8px] uppercase tracking-[0.2em] text-white/35">Booking reference</p>
          <p className="mt-1 font-mono text-sm tracking-[0.1em] text-white">{booking.id}</p>
          <p className="mt-3 max-w-[260px] text-[9px] leading-relaxed text-white/30">
            Demo ticket — not valid for entry. Carry a photo ID at the venue in a real booking.
          </p>
        </div>
        <MockQRCode value={booking.id} size={124} className={cn(cancelled && 'opacity-40 grayscale')} />
      </div>
    </article>
  )
}
