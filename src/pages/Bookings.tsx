import { CalendarDays, Clock3, MapPin, Ticket, TicketCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { bookingService } from '../services/bookingService'
import type { Booking } from '../types'
import { cn } from '../utils/cn'
import { formatDate, inr, showtimeLabel } from '../utils/format'

type Tab = 'upcoming' | 'past' | 'cancelled'

const showAt = (booking: Booking): Date => new Date(`${booking.showDate}T${booking.showTime}:00`)

const BookingRow = ({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) => {
  const cancelled = booking.status === 'cancelled'
  const upcoming = bookingService.isUpcoming(booking)
  const date = showAt(booking)

  return (
    <article className={cn('surface p-4 sm:p-5', cancelled && 'opacity-70')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <span className="text-[9px] uppercase tracking-[0.16em] text-white/35">
            {Number.isNaN(date.getTime()) ? '—' : formatDate(booking.showDate, { month: 'short' })}
          </span>
          <span className="font-display text-2xl leading-none text-white">
            {Number.isNaN(date.getTime()) ? '—' : date.getDate()}
          </span>
          <span className="mt-0.5 text-[8px] uppercase tracking-[0.14em] text-white/30">
            {Number.isNaN(date.getTime()) ? '' : formatDate(booking.showDate, { weekday: 'short' })}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/bookings/${booking.id}`} className="truncate font-display text-lg uppercase tracking-wide text-white hover:text-accent-300">
              {booking.movieTitle}
            </Link>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em]',
                cancelled
                  ? 'border-white/15 text-white/40'
                  : upcoming
                    ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100/80'
                    : 'border-white/15 bg-white/[0.03] text-white/45',
              )}
            >
              {cancelled ? 'Cancelled' : upcoming ? 'Upcoming' : 'Watched'}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-white/40">
            <span className="flex items-center gap-1.5">
              <MapPin size={10} /> {booking.theatreName}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={10} /> {formatDate(booking.showDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={10} /> {showtimeLabel(booking.showTime)}
            </span>
            <span>{booking.screenName}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {booking.seats.map((seat) => (
              <span key={seat} className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-white/60">
                {seat}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <div className="text-right">
            <p className="text-[8px] uppercase tracking-[0.16em] text-white/30">Paid</p>
            <p className="font-display text-lg leading-none text-white">{inr(booking.total)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/bookings/${booking.id}`} className="text-[10px] uppercase tracking-[0.14em] text-white/50 transition-colors hover:text-white">
              View ticket
            </Link>
            {upcoming && (
              <button
                type="button"
                onClick={() => onCancel(booking.id)}
                className="text-[10px] uppercase tracking-[0.14em] text-white/30 transition-colors hover:text-accent-300"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export const BookingsPage = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { data, loading, reload } = useAsync(
    () => (user ? bookingService.listByUser(user.id) : Promise.resolve([])),
    [user?.id],
  )

  const bookings = data ?? []
  const groups = useMemo(
    () => ({
      upcoming: bookings.filter((booking) => bookingService.isUpcoming(booking)),
      past: bookings.filter((booking) => booking.status === 'confirmed' && !bookingService.isUpcoming(booking)),
      cancelled: bookings.filter((booking) => booking.status === 'cancelled'),
    }),
    [bookings],
  )

  const handleCancel = async () => {
    if (!confirmId) return
    setBusy(true)
    try {
      const cancelled = await bookingService.cancel(confirmId)
      if (cancelled) {
        toast.success('Demo booking cancelled. No refund is processed.')
        reload()
      } else {
        toast.error('That demo booking could not be found.')
      }
    } finally {
      setBusy(false)
      setConfirmId(null)
    }
  }

  const confirmed = bookings.filter((booking) => booking.status === 'confirmed')
  const spent = confirmed.reduce((total, booking) => total + booking.total, 0)
  const next = [...groups.upcoming].sort((a, b) => +showAt(a) - +showAt(b))[0]
  const rows = groups[tab]

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Your account
          </p>
          <h1 className="display-title text-[clamp(2.4rem,5vw,4.4rem)] text-white">My bookings</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Demo tickets held in this browser, for {user?.name}. Nothing here is a real cinema reservation.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.16em] text-white/35">
          <div>
            <p className="font-display text-2xl normal-case tracking-normal text-white">{groups.upcoming.length}</p>
            <p className="mt-1">upcoming</p>
          </div>
          <div>
            <p className="font-display text-2xl normal-case tracking-normal text-white">{confirmed.length}</p>
            <p className="mt-1">tickets</p>
          </div>
          <div>
            <p className="font-display text-2xl normal-case tracking-normal text-white">{inr(spent)}</p>
            <p className="mt-1">demo spend</p>
          </div>
        </div>
      </div>

      {next && (
        <div className="surface mt-8 flex flex-wrap items-center justify-between gap-4 border-accent/20 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
              <TicketCheck size={16} />
            </span>
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">Next show</p>
              <p className="mt-1 font-display text-lg uppercase tracking-wide text-white">
                {next.movieTitle} · {formatDate(next.showDate, { weekday: 'short', day: 'numeric', month: 'short' })}
              </p>
              <p className="mt-1 text-[11px] text-white/45">
                {next.theatreName} · {showtimeLabel(next.showTime)} · seats {next.seats.join(', ')}
              </p>
            </div>
          </div>
          <Link to={`/bookings/${next.id}`} className="btn-ghost px-4 py-2.5 text-[11px]">
            Open ticket
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-white/10">
        {(
          [
            { key: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
            { key: 'past', label: 'Past', count: groups.past.length },
            { key: 'cancelled', label: 'Cancelled', count: groups.cancelled.length },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              'relative flex items-center gap-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
              tab === item.key ? 'text-white' : 'text-white/35 hover:text-white/70',
            )}
          >
            {item.label}
            <span className={cn('rounded-full px-1.5 py-0.5 text-[8px]', tab === item.key ? 'bg-accent/20 text-accent-200' : 'bg-white/[0.06] text-white/35')}>
              {item.count}
            </span>
            {tab === item.key && <span className="absolute inset-x-0 -bottom-px h-px bg-accent" />}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <Shimmer key={index} className="h-36 w-full rounded-2xl" />)
        ) : rows.length ? (
          rows.map((booking) => <BookingRow key={booking.id} booking={booking} onCancel={setConfirmId} />)
        ) : (
          <EmptyState
            icon={Ticket}
            title={tab === 'upcoming' ? 'No shows on the calendar' : tab === 'past' ? 'Nothing watched yet' : 'No cancellations'}
            description={
              tab === 'cancelled'
                ? 'Cancelled demo bookings will collect here.'
                : 'Book a sample screening and the e-ticket will appear in this list.'
            }
            actionLabel={tab === 'upcoming' ? 'Find a show' : undefined}
            actionHref={tab === 'upcoming' ? '/explore?status=now-showing' : undefined}
          />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Cancel this booking?"
        message="The demo ticket will be marked cancelled and removed from your upcoming shows. Refunds are simulated only."
        confirmLabel="Cancel booking"
        cancelLabel="Keep it"
        busy={busy}
        onConfirm={() => void handleCancel()}
        onClose={() => setConfirmId(null)}
      />
    </div>
  )
}
