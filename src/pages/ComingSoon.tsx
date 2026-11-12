import { CalendarDays, Clock, Play } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { TrailerModal } from '../components/common/TrailerModal'
import { MovieCard } from '../components/movie/MovieCard'
import { UpcomingSpotlight } from '../components/movie/UpcomingSpotlight'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import type { Movie } from '../types'
import { formatDate } from '../utils/format'

const monthKey = (iso: string) => formatDate(iso, { month: 'long', year: 'numeric' })

export const ComingSoonPage = () => {
  const { data, loading } = useAsync(() => movieService.upcoming(), [])
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null)
  const upcoming = data ?? []
  const featured = upcoming[upcoming.length - 1] ?? null

  const grouped = upcoming.reduce<Record<string, Movie[]>>((acc, movie) => {
    const key = monthKey(movie.releaseDate)
    acc[key] = [...(acc[key] ?? []), movie]
    return acc
  }, {})

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(70% 110% at 78% 0%, rgba(75,44,107,0.4), transparent 60%), linear-gradient(180deg, #0d0d0f, #080808)' }}
          aria-hidden
        />
        <div className="container-page relative pb-12 pt-14 sm:pt-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow mb-4 flex items-center gap-2">
                <span className="h-px w-8 bg-accent" /> On the horizon
              </p>
              <h1 className="display-title text-[clamp(2.8rem,6vw,5.6rem)] text-white">
                Before they <span className="serif-accent normal-case text-accent-300">open</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                The CINÉVO sample calendar for the weeks ahead. Countdowns are live; release dates, cast and artwork are
                fictional demo data.
              </p>
            </div>
            {featured && (
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end">
                <div className="text-left lg:text-right">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">Next up</p>
                  <p className="mt-1 font-display text-2xl uppercase tracking-wide text-white">{featured.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">{formatDate(featured.releaseDate)}</p>
                </div>
                <button type="button" onClick={() => setTrailerMovie(featured)} className="btn-ghost px-4 py-2.5 text-[11px]">
                  <Play size={12} className="fill-white" /> Trailer
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-[9px] uppercase tracking-[0.16em] text-white/30">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={11} className="text-accent" /> {upcoming.length} upcoming sample titles
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} /> Release dates are illustrative
            </span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="container-page space-y-4 py-12">
          <Shimmer className="h-72 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Shimmer key={index} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        </div>
      ) : upcoming.length ? (
        <>
          <section className="container-page py-12 sm:py-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow mb-2">The spotlight</p>
                <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">November, marked in red</h2>
              </div>
              <Link to="/face-off" className="link-underline text-xs">
                Vote in the face-off
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {[upcoming[1] ?? upcoming[0], upcoming[0]].filter(Boolean).slice(0, 2).map((movie, index) => (
                <UpcomingSpotlight key={movie.id} movie={movie} index={index} layout="wide" />
              ))}
            </div>
          </section>

          <section className="border-t border-white/10 py-12 sm:py-16">
            <div className="container-page">
              <div className="mb-8">
                <p className="eyebrow mb-2">Release calendar</p>
                <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">Month by month</h2>
              </div>

              <div className="space-y-10">
                {Object.entries(grouped).map(([month, movies]) => (
                  <div key={month} className="grid gap-5 lg:grid-cols-[180px_1fr] lg:gap-10">
                    <div className="lg:border-t lg:border-white/15 lg:pt-4">
                      <p className="font-display text-xl uppercase tracking-wide text-white">{month}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">{movies.length} releases</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
                      {movies.map((movie, index) => (
                        <MovieCard key={movie.id} movie={movie} index={index} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-12 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
                Demo calendar · Booking for coming-soon titles opens on their listed release date inside this build.
              </p>
            </div>
          </section>
        </>
      ) : (
        <div className="container-page py-16">
          <EmptyState
            icon={CalendarDays}
            title="Nothing on the calendar yet"
            description="Every sample title is already showing. Reset the demo data from the admin dashboard to restore the catalog."
            actionLabel="Explore now showing"
            actionHref="/explore?status=now-showing"
          />
        </div>
      )}

      <TrailerModal
        open={Boolean(trailerMovie)}
        onClose={() => setTrailerMovie(null)}
        title={trailerMovie?.title ?? ''}
        trailerUrl={trailerMovie?.trailerUrl ?? null}
      />
    </div>
  )
}
