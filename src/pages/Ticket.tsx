import { ArrowLeft, CalendarDays, CheckCircle2, ReceiptText, Ticket as TicketIcon, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { TicketCard } from '../components/booking/TicketCard'
import { useAsync } from '../hooks/useAsync'
import { bookingService } from '../services/bookingService'
import { inr, showtimeLabel } from '../utils/format'

export const TicketPage = () => {
  const { bookingId = '' } = useParams()
  const location = useLocation()
  const justBooked = Boolean((location.state as { justBooked?: boolean } | null)?.justBooked)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const { data: booking, loading, reload } = useAsync(() => bookingService.getById(bookingId), [bookingId])

  const handleCancel = async () => {
    setBusy(true)
    try {
      const cancelled = await bookingService.cancel(bookingId)
      if (!cancelled) {
        toast.error('This demo booking could not be found.')
        return
      }
      toast.success('Demo booking cancelled. No refund is processed.')
      reload()
    } finally {
      setBusy(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page max-w-3xl py-12">
        <Shimmer className="h-[420px] w-full rounded-2xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={TicketIcon}
          title="Ticket not found"
          description="This booking reference is not stored in this browser. Demo tickets live in local storage and disappear if site data is cleared."
          actionLabel="My bookings"
          actionHref="/bookings"
        />
      </div>
    )
  }

  const cancelled = booking.status === 'cancelled'

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft size={12} /> All bookings
      </Link>

      {justBooked && !cancelled && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3.5">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" />
          <div>
            <p className="text-xs font-semibold text-emerald-100">Your demo ticket is confirmed</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-100/60">
              Payment was simulated, so nothing was charged. Show this reference at the counter in a real booking.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <TicketCard booking={booking} />
      </div>

      <div className="surface mt-5 p-5">
        <p className="eyebrow mb-4 flex items-center gap-1.5">
          <ReceiptText size={11} className="text-accent" /> Payment summary
        </p>
        <dl className="space-y-2.5 text-xs">
          {[
            { label: 'Booking reference', value: booking.id },
            { label: 'Show', value: `${booking.showDate} · ${showtimeLabel(booking.showTime)}` },
            { label: 'Seats', value: booking.seats.join(', ') },
            { label: 'Tickets', value: inr(booking.ticketSubtotal) },
            { label: 'Convenience fee', value: inr(booking.convenienceFee) },
            { label: 'GST (18%)', value: inr(booking.gst) },
            { label: 'Paid via', value: `${booking.paymentMethod} · demo` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-4 border-b border-white/[0.07] pb-2 last:border-0 last:pb-0">
              <dt className="shrink-0 text-white/35">{row.label}</dt>
              <dd className="text-right capitalize text-white/80">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-end justify-between pt-1">
            <dt className="text-[10px] uppercase tracking-[0.16em] text-white/45">Total</dt>
            <dd className="font-display text-2xl leading-none text-white">{inr(booking.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link to={`/movies/${booking.movieId}`} className="btn-ghost px-5 py-2.5 text-[11px]">
          <CalendarDays size={13} /> Back to the film
        </Link>
        {!cancelled ? (
          <button type="button" onClick={() => setConfirmOpen(true)} className="btn-quiet px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-white/40">
            <XCircle size={13} /> Cancel booking
          </button>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">This demo booking was cancelled</span>
        )}
      </div>

      <p className="mt-6 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
        Demo e-ticket · the payment QR is for the supplied UPI handle, but no payment was verified and no seat is held
        outside this browser.
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message={`Booking ${booking.id} for ${booking.movieTitle} will be marked cancelled. Refunds are simulated in this demo and the seat hold is released locally.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep it"
        busy={busy}
        onConfirm={() => void handleCancel()}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
