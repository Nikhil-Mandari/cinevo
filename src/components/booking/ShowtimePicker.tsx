import { CalendarClock, ChevronRight, MapPin, Ticket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from '../../context/LocationContext'
import { startOfToday, isoDate } from '../../data/theatres'
import { useAsync } from '../../hooks/useAsync'
import { showtimeService } from '../../services/showtimeService'
import { theatreService } from '../../services/theatreService'
import type { Movie, Showtime, Theatre } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, formatDay, minutesFromTime, showtimeLabel } from '../../utils/format'
import { Shimmer } from '../common/Skeletons'

interface ShowtimePickerProps {
  movie: Movie
  className?: string
}

const isPastShow = (date: string, time: string): boolean => {
  const today = isoDate(startOfToday())
  if (date > today) return false
  if (date < today) return true
  const now = new Date()
  return minutesFromTime(time) <= now.getHours() * 60 + now.getMinutes()
}

const groupBy = <T,>(items: T[], key: (item: T) => string): Map<string, T[]> => {
  const map = new Map<string, T[]>()
  items.forEach((item) => {
    const group = key(item)
    map.set(group, [...(map.get(group) ?? []), item])
  })
  return map
}

export const ShowtimePicker = ({ movie, className }: ShowtimePickerProps) => {
  const { city, setCity } = useLocation()
  const [selectedDate, setSelectedDate] = useState('')

  const { data, loading } = useAsync(
    async () => {
      const [showtimes, theatres] = await Promise.all([
        showtimeService.listByMovie(movie.id, { city }),
        theatreService.list(city),
      ])
      return { showtimes, theatres }
    },
    [movie.id, city],
  )

  const showtimes = useMemo(() => data?.showtimes ?? [], [data])
  const theatres = useMemo(() => data?.theatres ?? [], [data])
  const today = isoDate(startOfToday())
  const dates = useMemo(
    () =>
      [...new Set(showtimes.filter((showtime) => showtime.date >= today).map((showtime) => showtime.date))].sort(),
    [showtimes, today],
  )
  const activeDate = dates.includes(selectedDate) ? selectedDate : (dates[0] ?? '')
  const dayShows = showtimes.filter((showtime) => showtime.date === activeDate)
  const theatreMap = useMemo(
    () => new Map(theatres.map((theatre) => [theatre.id, theatre])),
    [theatres],
  )
  const byTheatre = groupBy(dayShows, (showtime) => showtime.theatreId)

  if (movie.status === 'coming-soon' && !dates.length) {
    return (
      <div className={cn('surface flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between', className)}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
            <CalendarClock size={16} />
          </span>
          <div>
            <p className="font-display text-base uppercase tracking-wide text-white">Booking opens {formatDate(movie.releaseDate)}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Showtimes for {movie.title} are not live yet. Cinema and pricing data in CINÉVO is sample data.
            </p>
          </div>
        </div>
        <Link to={`/movies/${movie.id}`} className="btn-ghost shrink-0 px-4 py-2 text-[11px]">
          Movie details <ChevronRight size={12} />
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Shimmer key={index} className="h-16 w-[68px] rounded-xl" />
          ))}
        </div>
        <Shimmer className="h-32 w-full rounded-2xl" />
        <Shimmer className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  if (!dates.length) {
    return (
      <div className={cn('surface p-8 text-center', className)}>
        <MapPin size={20} className="mx-auto text-white/40" />
        <p className="mt-3 font-display text-lg uppercase tracking-wide text-white">No shows listed in {city}</p>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted">
          CINÉVO currently lists venues in Hyderabad and Medak. Showtimes and availability are demo data until a cinema API is connected.
        </p>
        {city !== 'Hyderabad' && (
          <button type="button" onClick={() => setCity('Hyderabad')} className="btn-primary mt-4 px-4 py-2 text-[11px]">
            Browse Hyderabad shows
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-1.5 flex items-center gap-1.5">
            <Ticket size={11} className="text-accent" /> Choose a show
          </p>
          <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">Showtimes near you</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-muted">
          <span className="h-1 w-1 animate-pulse-dot rounded-full bg-accent" />
          {city} · Verified venue references
        </span>
      </div>

      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {dates.map((date) => {
          const active = date === activeDate
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              aria-pressed={active}
              className={cn(
                'flex min-w-[66px] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-all duration-300',
                active
                  ? 'border-accent bg-accent text-white shadow-[0_10px_30px_-12px_rgba(229,9,20,0.8)]'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white',
              )}
            >
              <span className={cn('text-[9px] font-semibold uppercase tracking-[0.16em]', active ? 'text-white/80' : 'text-muted')}>
                {formatDay(date)}
              </span>
              <span className="mt-1 font-display text-xl leading-none">{Number(date.slice(8, 10))}</span>
              <span className={cn('mt-1 text-[8px] uppercase tracking-[0.16em]', active ? 'text-white/70' : 'text-white/35')}>
                {formatDate(date, { month: 'short' })}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {[...byTheatre.entries()].map(([theatreId, shows]) => {
          const theatre: Theatre | undefined = theatreMap.get(theatreId)
          if (!theatre) return null
          const byScreen = groupBy(shows, (showtime) => showtime.screenId)
          return (
            <div key={theatreId} className="surface p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base uppercase tracking-wide text-white">{theatre.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {theatre.area} · {theatre.address}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {theatre.amenities.slice(0, 3).map((amenity) => (
                    <span key={amenity} className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-white/45">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[...byScreen.entries()].map(([screenId, screenShows]) => {
                  const first = screenShows[0]
                  const screen = theatre.screens.find((item) => item.id === screenId)
                  return (
                    <div key={screenId} className="border-t border-white/[0.07] pt-3 first:border-0 first:pt-0">
                      <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-white/35">
                        {screen?.name ?? 'Screen'} · {first.format} · {[...new Set(screenShows.map((show) => show.language))].join(' / ')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {screenShows.map((showtime: Showtime) => {
                          const past = isPastShow(showtime.date, showtime.time)
                          return past ? (
                            <span
                              key={showtime.id}
                              title="This show has already started"
                              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] px-3 py-1.5 text-[11px] text-white/20 line-through"
                            >
                              {showtimeLabel(showtime.time)}
                            </span>
                          ) : (
                            <Link
                              key={showtime.id}
                              to={`/book/${movie.id}/seats/${showtime.id}`}
                              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] font-medium text-emerald-200/90 transition-all hover:border-emerald-300/60 hover:bg-emerald-400/15 hover:text-white"
                            >
                              {showtimeLabel(showtime.time)}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-white/30">
        Cinemas, screens and showtimes are sample data created for this demo. Prices are illustrative and exclude taxes until checkout.
        Green timings are bookable.
      </p>
    </div>
  )
}
