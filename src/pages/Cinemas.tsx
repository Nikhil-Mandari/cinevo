import { Armchair, Building2, Clock3, MapPin, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { isoDate, startOfToday } from '../data/theatres'
import { useLocation as useCity } from '../context/LocationContext'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import { showtimeService } from '../services/showtimeService'
import { theatreService } from '../services/theatreService'
import type { Movie } from '../types'
import { cn } from '../utils/cn'

export const CinemasPage = () => {
  const { city, cities, setCity } = useCity()
  const { data, loading } = useAsync(async () => {
    const [theatres, movies, showtimes] = await Promise.all([
      theatreService.list(city),
      movieService.list(),
      showtimeService.listAll(),
    ])
    return { theatres, movies, showtimes }
  }, [city])

  const today = isoDate(startOfToday())
  const theatres = data?.theatres ?? []
  const movieMap = new Map<string, Movie>((data?.movies ?? []).map((movie) => [movie.id, movie]))
  const shows = (data?.showtimes ?? []).filter((showtime) => showtime.date >= today)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(65% 120% at 20% 0%, rgba(39,74,86,0.35), transparent 60%), linear-gradient(180deg, #0b0d0d, #080808)' }}
          aria-hidden
        />
        <div className="container-page relative py-12 sm:py-16">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Cinema directory
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="display-title text-[clamp(2.6rem,5.6vw,5rem)] text-white">
                Rooms with a <span className="serif-accent normal-case text-accent-300">projector</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                Sample multiplexes, screens and formats used by the booking flow. Addresses and amenities are fictional
                and only Hyderabad has listings in this build.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] text-white/50">
              <MapPin size={11} className="text-accent" /> {city} · {theatres.length} cinemas
            </span>
          </div>

          <div className="no-scrollbar -mx-1 mt-7 flex gap-2 overflow-x-auto px-1 pb-1">
            {cities.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCity(option)}
                aria-pressed={option === city}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors',
                  option === city
                    ? 'border-accent bg-accent/15 text-white'
                    : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-12">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Shimmer key={index} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : theatres.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {theatres.map((theatre) => {
              const theatreShows = shows.filter((showtime) => showtime.theatreId === theatre.id)
              const movieIds = [...new Set(theatreShows.map((showtime) => showtime.movieId))]
              const showsToday = theatreShows.filter((showtime) => showtime.date === today).length
              return (
                <article key={theatre.id} className="surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl uppercase tracking-wide text-white">{theatre.name}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/40">
                        <MapPin size={11} className="text-accent/70" /> {theatre.area} · {city}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-white/45">
                      <Building2 size={10} /> {theatre.screens.length} screen{theatre.screens.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-white/35">{theatre.address}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {theatre.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-white/45">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-1.5 border-t border-white/[0.07] pt-3">
                    {theatre.screens.map((screen) => (
                      <div key={screen.id} className="flex items-center justify-between gap-3 text-[10px]">
                        <span className="flex items-center gap-2 text-white/55">
                          <Armchair size={11} className="text-white/25" /> {screen.name}
                        </span>
                        <span className="text-right text-white/30">
                          {screen.format} · {screen.seatLayout.rows * screen.seatLayout.cols} seats
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/35">
                      <Clock3 size={10} /> {showsToday} show{showsToday === 1 ? '' : 's'} today
                    </p>
                    {movieIds.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {movieIds.slice(0, 3).map((movieId) => {
                          const movie = movieMap.get(movieId)
                          if (!movie) return null
                          return (
                            <Link
                              key={movieId}
                              to={`/book/${movieId}`}
                              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
                            >
                              <Ticket size={9} /> {movie.title}
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-[9px] uppercase tracking-[0.14em] text-white/25">No shows listed</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={MapPin}
            title={`No sample cinemas in ${city} yet`}
            description="CINÉVO only ships with demo venues for Hyderabad. Switch the city below to browse bookable shows."
            actionLabel="Browse Hyderabad cinemas"
            onAction={() => setCity('Hyderabad')}
          />
        )}

        <p className="mt-10 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
          Venue names, addresses, screens and seat counts are sample data. No real cinema or ticketing partner is
          affiliated with this demo.
        </p>
      </section>
    </div>
  )
}
