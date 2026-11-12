import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  Landmark,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
  Ticket,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { OrderSummary } from '../components/booking/OrderSummary'
import { SeatMap } from '../components/booking/SeatMap'
import { StepIndicator } from '../components/booking/StepIndicator'
import { DEMO_UPI_ID, UpiQrCode } from '../components/booking/UpiQrCode'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { bookingService, type BookingDraft } from '../services/bookingService'
import { movieService } from '../services/movieService'
import { showtimeService } from '../services/showtimeService'
import { theatreService } from '../services/theatreService'
import type { PaymentMethod, Seat } from '../types'
import { cn } from '../utils/cn'
import { formatDate, inr, showtimeLabel } from '../utils/format'
import { MAX_SEATS, buildPriceBreakdown, buildSeatMap } from '../utils/seats'

const STEPS = ['Showtime', 'Seats', 'Payment', 'Ticket']

interface PaymentOption {
  value: PaymentMethod
  label: string
  hint: string
  icon: LucideIcon
  field?: 'upi' | 'card'
}

const PAYMENT_METHODS: PaymentOption[] = [
  { value: 'upi', label: 'UPI', hint: 'Any demo handle, e.g. name@okbank', icon: Smartphone, field: 'upi' },
  { value: 'card', label: 'Card', hint: 'Demo card number, nothing is charged', icon: CreditCard, field: 'card' },
  { value: 'netbanking', label: 'Net banking', hint: 'Sample bank redirect', icon: Landmark },
  { value: 'wallet', label: 'Wallet', hint: 'Simulated wallet balance', icon: Wallet },
]

export const SeatSelectionPage = () => {
  const { movieId = '', showtimeId = '' } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [selected, setSelected] = useState<string[]>([])
  const [stage, setStage] = useState<'seats' | 'payment'>('seats')
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [paymentRef, setPaymentRef] = useState(DEMO_UPI_ID)
  const [submitting, setSubmitting] = useState(false)

  const { data, loading, error } = useAsync(async () => {
    const [movie, showtime] = await Promise.all([
      movieService.getById(movieId),
      showtimeService.getById(showtimeId),
    ])
    if (!movie || !showtime) return { movie, showtime, theatre: null, screen: null }
    const theatre = await theatreService.getById(showtime.theatreId)
    const screen = theatre?.screens.find((item) => item.id === showtime.screenId) ?? null
    return { movie, showtime, theatre, screen }
  }, [movieId, showtimeId])

  const seats = useMemo(
    () => (data?.showtime && data.screen ? buildSeatMap(data.showtime, data.screen) : []),
    [data],
  )
  const selectedSeats = useMemo(() => seats.filter((seat) => selected.includes(seat.id)), [seats, selected])
  const breakdown = useMemo(() => buildPriceBreakdown(selectedSeats), [selectedSeats])
  const activeMethod = PAYMENT_METHODS.find((item) => item.value === method) ?? PAYMENT_METHODS[0]
  const paymentValid = useMemo(() => {
    if (activeMethod.field === 'upi') return /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(paymentRef.trim())
    if (activeMethod.field === 'card') return paymentRef.replace(/\D/g, '').length >= 12
    return true
  }, [activeMethod, paymentRef])

  const toggleSeat = (seat: Seat) => {
    setSelected((current) => {
      if (current.includes(seat.id)) return current.filter((id) => id !== seat.id)
      if (current.length >= MAX_SEATS) {
        toast.info(`Up to ${MAX_SEATS} seats per booking in this demo.`)
        return current
      }
      return [...current, seat.id]
    })
  }

  const handleContinue = () => {
    if (!selectedSeats.length) {
      toast.info('Pick at least one seat to continue.')
      return
    }
    setStage('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirm = async () => {
    if (!data?.movie || !data.showtime || !data.theatre || !data.screen || !user) return
    if (!selectedSeats.length) return
    if (!paymentValid) {
      toast.error(activeMethod.field === 'upi' ? 'Enter a demo UPI ID like name@okbank.' : 'Enter at least 12 digits for the demo card.')
      return
    }
    setSubmitting(true)
    try {
      const draft: BookingDraft = {
        userId: user.id,
        movieId: data.movie.id,
        theatreId: data.theatre.id,
        showtimeId: data.showtime.id,
        showDate: data.showtime.date,
        showTime: data.showtime.time,
        screenName: data.screen.name,
        seats: selectedSeats.map((seat) => seat.id),
        seatClasses: selectedSeats.map((seat) => seat.seatClass),
        ticketSubtotal: breakdown.ticketSubtotal,
        convenienceFee: breakdown.convenienceFee,
        gst: breakdown.gst,
        total: breakdown.total,
        paymentMethod: method,
        movieTitle: data.movie.title,
        theatreName: data.theatre.name,
        posterTone: data.movie.tone,
      }
      const booking = await bookingService.create(draft)
      toast.success('Payment simulated — your demo ticket is ready.')
      navigate(`/bookings/${booking.id}`, { replace: true, state: { justBooked: true } })
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'The demo booking could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <Shimmer className="h-4 w-28 rounded" />
        <Shimmer className="mt-6 h-20 w-full rounded-2xl" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <Shimmer className="h-[520px] rounded-2xl" />
          <Shimmer className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Ticket}
          title="The projector stalled"
          description={error}
          actionLabel="Back to Explore"
          actionHref="/explore"
        />
      </div>
    )
  }

  if (!data?.movie || !data.showtime || !data.theatre || !data.screen) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Ticket}
          title="This show is no longer listed"
          description="Seats are generated per show, so this link needs a live sample screening. Pick another timing from the film page."
          actionLabel="Choose another show"
          actionHref={`/book/${movieId}`}
        />
      </div>
    )
  }

  const { movie, showtime, theatre, screen } = data

  return (
    <div className="container-page py-8 sm:py-10">
      <Link
        to={`/book/${movie.id}`}
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft size={12} /> Change showtime
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <Ticket size={11} className="text-accent" /> {movie.title}
          </p>
          <h1 className="display-title text-[clamp(1.9rem,4vw,3rem)] text-white">
            {stage === 'seats' ? 'Pick your seats' : 'Simulate payment'}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span className="flex items-center gap-1.5">
              <MapPin size={11} className="text-accent" /> {theatre.name} · {theatre.area}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={11} /> {formatDate(showtime.date, { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={11} /> {showtimeLabel(showtime.time)}
            </span>
            <span>
              {screen.name} · {screen.format} · {showtime.language}
            </span>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-muted">
          {showtime.format}
        </span>
      </div>

      <div className="mt-6 border-y border-white/10 py-4">
        <StepIndicator steps={STEPS} current={stage === 'seats' ? 1 : 2} />
      </div>

      {!isAuthenticated ? (
        <div className="mt-8">
          <EmptyState
            icon={LockKeyhole}
            title="Sign in to hold these seats"
            description="CINÉVO issues demo tickets against a sample account, so seat holds need a quick sign-in. Seats are not reserved until you confirm."
            actionLabel="Sign in to continue"
            actionHref={`/login?next=${encodeURIComponent(`/book/${movieId}/seats/${showtimeId}`)}`}
          />
          <p className="mt-3 text-center text-[10px] text-white/25">
            New here?{' '}
            <Link to="/register" className="text-white/60 underline-offset-4 hover:text-white hover:underline">
              Create a demo account
            </Link>
          </p>
        </div>
      ) : stage === 'seats' ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <SeatMap screen={screen} seats={seats} selected={selected} onToggle={toggleSeat} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                {selectedSeats.length ? `${selectedSeats.length} seat${selectedSeats.length === 1 ? '' : 's'} held` : 'No seats selected'}
              </p>
              <button type="button" onClick={handleContinue} disabled={!selectedSeats.length} className="btn-primary px-5 py-2.5 text-xs">
                Continue to payment
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface p-5">
              <p className="eyebrow mb-3 flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-accent" /> Show details
              </p>
              <dl className="space-y-2.5 text-xs">
                {[
                  { label: 'Film', value: movie.title },
                  { label: 'Cinema', value: `${theatre.name}, ${theatre.area}` },
                  { label: 'Screen', value: `${screen.name} · ${screen.format}` },
                  { label: 'Date', value: formatDate(showtime.date, { weekday: 'short', day: 'numeric', month: 'short' }) },
                  { label: 'Showtime', value: `${showtimeLabel(showtime.time)} · ${showtime.language}` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 border-b border-white/[0.07] pb-2 last:border-0 last:pb-0">
                    <dt className="shrink-0 text-white/35">{row.label}</dt>
                    <dd className="text-right text-white/75">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <OrderSummary seats={selectedSeats} breakdown={breakdown} />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="surface p-5">
              <p className="eyebrow mb-3 flex items-center gap-1.5">
                <CreditCard size={11} className="text-accent" /> Payment method
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.map((option) => {
                  const active = method === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMethod(option.value)
                        setPaymentRef(option.value === 'upi' ? DEMO_UPI_ID : '')
                      }}
                      aria-pressed={active}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                        active ? 'border-accent/60 bg-accent/10' : 'border-white/10 bg-white/[0.02] hover:border-white/25',
                      )}
                    >
                      <option.icon size={16} className={cn('mt-0.5 shrink-0', active ? 'text-accent' : 'text-white/40')} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                          {option.label}
                          {active && <Check size={11} className="text-accent" />}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-relaxed text-white/35">{option.hint}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {activeMethod.field && (
                <div className="mt-4">
                  {activeMethod.field === 'upi' && (
                    <div className="mb-4 flex flex-col items-center gap-3 rounded-xl border border-accent/20 bg-accent/[0.05] p-4 sm:flex-row sm:items-start">
                      <UpiQrCode amount={breakdown.total} size={142} />
                      <div className="pt-1 text-center sm:text-left">
                        <p className="text-xs font-medium text-white">Scan to pay with any UPI app</p>
                        <p className="mt-1 text-[10px] leading-relaxed text-white/45">
                          Use the CINÉVO demo merchant handle below. Payment is not verified or transferred by this demo.
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-accent-200">{DEMO_UPI_ID}</p>
                      </div>
                    </div>
                  )}
                  <label className="block">
                    <span className="label">{activeMethod.field === 'upi' ? 'UPI ID used for this demo' : 'Card number'}</span>
                    <input
                      value={paymentRef}
                      onChange={(event) =>
                        setPaymentRef(
                          activeMethod.field === 'card'
                            ? event.target.value.replace(/[^\d ]/g, '').slice(0, 19)
                            : event.target.value.replace(/\s/g, '')
                        )
                      }
                      inputMode={activeMethod.field === 'card' ? 'numeric' : 'text'}
                      placeholder={activeMethod.field === 'upi' ? DEMO_UPI_ID : '4111 1111 1111 1111'}
                      className="field"
                    />
                    <span className="mt-1.5 block text-[10px] text-white/25">
                      {activeMethod.field === 'upi'
                        ? 'The supplied handle is prefilled; no payment confirmation is checked.'
                        : 'Use any 12–19 digit number. No card is charged or stored.'}
                    </span>
                  </label>
                </div>
              )}

              <p className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[10px] leading-relaxed text-white/35">
                <LockKeyhole size={12} className="mt-0.5 shrink-0 text-accent/70" />
                This is a simulated checkout. CINÉVO does not process payments, store card numbers or issue real
                tickets.
              </p>
            </div>

            <div className="surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="eyebrow mb-1">Your seats</p>
                  <p className="text-xs text-white/60">
                    {selectedSeats.map((seat) => seat.id).join(', ')}
                  </p>
                </div>
                <button type="button" onClick={() => setStage('seats')} className="btn-quiet text-[10px] uppercase tracking-[0.14em]">
                  Edit seats
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <OrderSummary seats={selectedSeats} breakdown={breakdown} />
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={submitting || !selectedSeats.length}
              className="btn-primary w-full px-5 py-3.5 text-xs"
            >
              <ShieldCheck size={14} /> {submitting ? 'Confirming…' : `Pay ${inr(breakdown.total)} · demo`}
            </button>
            <button type="button" onClick={() => setStage('seats')} disabled={submitting} className="btn-ghost w-full px-5 py-2.5 text-[11px]">
              Back to seats
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
