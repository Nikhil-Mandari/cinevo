import { ArrowLeft, CalendarDays, Clock3, MapPin, Ticket } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { StepIndicator } from '../components/booking/StepIndicator'
import { ShowtimePicker } from '../components/booking/ShowtimePicker'
import { EmptyState } from '../components/common/EmptyState'
import { PosterArt } from '../components/common/PosterArt'
import { Shimmer } from '../components/common/Skeletons'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import { formatRuntime } from '../utils/format'

const STEPS = ['Showtime', 'Seats', 'Payment', 'Ticket']

export const BookingPage = () => {
  const { movieId = '' } = useParams()
  const { data: movie, loading } = useAsync(() => movieService.getById(movieId), [movieId])

  if (loading) {
    return (
      <div className="container-page py-10">
        <Shimmer className="h-4 w-28 rounded" />
        <Shimmer className="mt-6 h-40 w-full rounded-2xl" />
        <Shimmer className="mt-8 h-72 w-full rounded-2xl" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Ticket}
          title="This show does not exist"
          description="The title behind this booking link is not in the sample catalog. Pick another film and try again."
          actionLabel="Back to Explore"
          actionHref="/explore"
        />
      </div>
    )
  }

  return (
    <div className="container-page py-8 sm:py-10">
      <Link
        to={`/movies/${movie.id}`}
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white"
      >
        <ArrowLeft size={12} /> Back to film
      </Link>

      <div className="mt-6 grid gap-6 sm:grid-cols-[96px_1fr] sm:items-center">
        <div className="hidden aspect-[2/3] w-24 overflow-hidden rounded-lg border border-white/15 sm:block">
          <PosterArt movie={movie} size="sm" />
        </div>
        <div>
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <Ticket size={11} className="text-accent" /> Booking · step 1 of 4
          </p>
          <h1 className="display-title text-[clamp(2rem,4.4vw,3.4rem)] text-white">{movie.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={11} /> {movie.certificate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 size={11} /> {formatRuntime(movie.runtime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={11} /> Hyderabad & Medak venues
            </span>
            <span>{movie.languages.join(' · ')}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-y border-white/10 py-4">
        <StepIndicator steps={STEPS} current={0} />
      </div>

      <div className="mt-8">
        <ShowtimePicker movie={movie} />
      </div>
    </div>
  )
}
