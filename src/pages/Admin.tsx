import {
  Building2,
  CalendarClock,
  Film,
  LayoutDashboard,
  RefreshCw,
  RotateCcw,
  Star,
  Ticket,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Shimmer } from '../components/common/Skeletons'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { bookingService } from '../services/bookingService'
import { movieService } from '../services/movieService'
import { showtimeService } from '../services/showtimeService'
import { theatreService } from '../services/theatreService'
import type { Movie } from '../types'
import { cn } from '../utils/cn'
import { formatDate, inr } from '../utils/format'

type PendingAction =
  | { kind: 'delete'; movie: Movie }
  | { kind: 'regenerate' }
  | { kind: 'reset' }
  | null

export const AdminPage = () => {
  const { user } = useAuth()
  const { data, loading, reload } = useAsync(async () => {
    const [movies, theatres, showtimes, bookings, featured] = await Promise.all([
      movieService.list(),
      theatreService.list(),
      showtimeService.listAll(),
      bookingService.listAll(),
      movieService.featured(),
    ])
    return { movies, theatres, showtimes, bookings, featuredIds: featured.map((movie) => movie.id) }
  }, [])
  const [featuredOverride, setFeaturedOverride] = useState<string[] | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)
  const [busy, setBusy] = useState(false)

  const refresh = () => {
    setFeaturedOverride(null)
    reload()
  }

  const movies = data?.movies ?? []
  const featuredIds = featuredOverride ?? data?.featuredIds ?? []
  const nowShowing = movies.filter((movie) => movie.status === 'now-showing').length
  const comingSoon = movies.filter((movie) => movie.status === 'coming-soon').length

  const toggleFeatured = async (movie: Movie) => {
    const active = featuredIds.includes(movie.id)
    const next = active ? featuredIds.filter((id) => id !== movie.id) : [...featuredIds, movie.id]
    setFeaturedOverride(next)
    try {
      await movieService.setFeatured(next)
      toast.success(active ? `Removed ${movie.title} from the hero carousel.` : `Featured ${movie.title} in the hero carousel.`)
    } catch (reason) {
      setFeaturedOverride(featuredIds)
      toast.error(reason instanceof Error ? reason.message : 'Could not update the featured lineup.')
    }
  }

  const runPending = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'delete') {
        await movieService.remove(pending.movie.id)
        toast.success(`${pending.movie.title} removed from the demo catalog.`)
        refresh()
      } else if (pending.kind === 'regenerate') {
        const shows = await showtimeService.regenerate()
        toast.success(`Rebuilt the rolling programme — ${shows.length} sample shows.`)
        refresh()
      } else {
        await movieService.resetDemoData()
        toast.success('Demo catalog, showtimes, bookings and community data reset.')
        refresh()
      }
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'That admin action failed.')
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-12">
        <Shimmer className="h-10 w-64 rounded" />
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Shimmer key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <Shimmer className="mt-8 h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Studio dashboard
          </p>
          <h1 className="display-title text-[clamp(2.3rem,5vw,4rem)] text-white">Admin demo</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Signed in as {user?.name}. Catalog edits are stored in this browser, so every change only affects your own
            copy of the demo.
          </p>
        </div>
        <Link to="/explore" className="btn-ghost px-4 py-2.5 text-[11px]">
          <LayoutDashboard size={13} /> View the site
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Films in catalog', value: movies.length, hint: `${nowShowing} showing · ${comingSoon} upcoming`, icon: Film },
          { label: 'Cinemas', value: data?.theatres.length ?? 0, hint: 'Hyderabad sample venues', icon: Building2 },
          { label: 'Showtimes', value: data?.showtimes.length ?? 0, hint: 'Rolling 9-day programme', icon: CalendarClock },
          { label: 'Bookings', value: data?.bookings.length ?? 0, hint: 'Demo tickets in this browser', icon: Ticket },
        ].map((stat) => (
          <div key={stat.label} className="surface p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">{stat.label}</p>
              <stat.icon size={14} className="text-accent/70" />
            </div>
            <p className="mt-2 font-display text-3xl leading-none text-white">{stat.value}</p>
            <p className="mt-1.5 text-[9px] uppercase tracking-[0.12em] text-white/25">{stat.hint}</p>
          </div>
        ))}
      </div>

      <section className="surface mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="eyebrow mb-1">Catalog</p>
            <h2 className="font-display text-lg uppercase tracking-wide text-white">Films & hero lineup</h2>
          </div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">{featuredIds.length} featured</p>
        </div>

        <div className="hidden grid-cols-[minmax(0,1fr)_110px_130px_80px_44px] gap-3 border-b border-white/10 px-5 py-2.5 text-[8px] uppercase tracking-[0.16em] text-white/30 md:grid">
          <span>Film</span>
          <span>Status</span>
          <span>Release</span>
          <span>Hero</span>
          <span className="text-right">Del</span>
        </div>

        <div>
          {movies.map((movie) => {
            const featured = featuredIds.includes(movie.id)
            return (
              <div
                key={movie.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.06] px-5 py-3 last:border-0 hover:bg-white/[0.02] md:grid-cols-[minmax(0,1fr)_110px_130px_80px_44px]"
              >
                <div className="min-w-0">
                  <Link to={`/movies/${movie.id}`} className="truncate text-xs font-medium text-white hover:text-accent-300">
                    {movie.title}
                  </Link>
                  <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.12em] text-white/25">
                    {movie.genres.slice(0, 3).join(' · ')} · {movie.languages.join('/')}
                  </p>
                </div>

                <div className="hidden md:block">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-[0.1em]',
                      movie.status === 'now-showing'
                        ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100/70'
                        : 'border-white/15 text-white/40',
                    )}
                  >
                    {movie.status === 'now-showing' ? 'Showing' : 'Upcoming'}
                  </span>
                </div>

                <p className="hidden text-[10px] text-white/40 md:block">{formatDate(movie.releaseDate)}</p>

                <div className="hidden md:block">
                  <button
                    type="button"
                    onClick={() => void toggleFeatured(movie)}
                    aria-pressed={featured}
                    aria-label={`${featured ? 'Remove' : 'Add'} ${movie.title} ${featured ? 'from' : 'to'} the hero carousel`}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                      featured
                        ? 'border-accent/40 bg-accent/15 text-accent-300'
                        : 'border-white/10 text-white/25 hover:border-white/30 hover:text-white',
                    )}
                  >
                    <Star size={12} className={featured ? 'fill-accent/40' : ''} />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => void toggleFeatured(movie)}
                    aria-label={`Toggle featured for ${movie.title}`}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full border transition-colors md:hidden',
                      featured ? 'border-accent/40 bg-accent/15 text-accent-300' : 'border-white/10 text-white/25',
                    )}
                  >
                    <Star size={12} className={featured ? 'fill-accent/40' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPending({ kind: 'delete', movie })}
                    aria-label={`Delete ${movie.title}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/25 transition-colors hover:border-accent/40 hover:text-accent-300"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="surface p-5">
          <p className="eyebrow mb-1">Operations</p>
          <h2 className="font-display text-lg uppercase tracking-wide text-white">Demo data controls</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/35">
            Showtimes are generated from the catalog for the next nine days. Rebuilding keeps the catalog but replaces
            every screening; a full reset also clears bookings and community posts.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setPending({ kind: 'regenerate' })} className="btn-ghost flex-1 px-4 py-2.5 text-[11px]">
              <RefreshCw size={13} /> Rebuild showtimes
            </button>
            <button type="button" onClick={() => setPending({ kind: 'reset' })} className="btn-ghost flex-1 px-4 py-2.5 text-[11px]">
              <RotateCcw size={13} /> Reset demo data
            </button>
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-white/25">
            Accounts and the current session survive a reset so you stay signed in.
          </p>
        </section>

        <section className="surface p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="eyebrow mb-1">Activity</p>
              <h2 className="font-display text-lg uppercase tracking-wide text-white">Recent demo bookings</h2>
            </div>
            <Ticket size={15} className="text-white/25" />
          </div>
          {data?.bookings.length ? (
            <ul className="mt-3 space-y-2">
              {data.bookings.slice(0, 5).map((booking) => (
                <li key={booking.id} className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-2 text-[11px] last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-white/75">{booking.movieTitle}</p>
                    <p className="mt-0.5 truncate font-mono text-[9px] text-white/25">
                      {booking.id} · {booking.seats.length} seats
                    </p>
                  </div>
                  <span className={cn('shrink-0 text-[10px]', booking.status === 'cancelled' ? 'text-white/25 line-through' : 'text-white/70')}>
                    {inr(booking.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-[11px] text-white/30">
              No demo bookings yet. Book a sample show to see it here.
            </p>
          )}
        </section>
      </div>

      <p className="mt-8 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
        Admin demo · mock service layer only. In the planned Spring Boot build these actions map to protected REST
        endpoints on movie-service, theatre-service and showtime-service.
      </p>

      <ConfirmDialog
        open={Boolean(pending)}
        title={
          pending?.kind === 'delete'
            ? `Delete ${pending.movie.title}?`
            : pending?.kind === 'regenerate'
              ? 'Rebuild every showtime?'
              : 'Reset all demo data?'
        }
        message={
          pending?.kind === 'delete'
            ? 'The film is removed from the catalog, featured lineup and sample bookings for this browser. This cannot be undone without resetting the demo.'
            : pending?.kind === 'regenerate'
              ? 'Every generated screening is replaced with a fresh nine-day programme. Existing demo bookings keep their snapshot details.'
              : 'Catalog, cinemas, showtimes, bookings, votes and community posts return to their seeded state. Your account and current session are kept.'
        }
        confirmLabel={pending?.kind === 'delete' ? 'Delete film' : pending?.kind === 'regenerate' ? 'Rebuild showtimes' : 'Reset everything'}
        busy={busy}
        onConfirm={() => void runPending()}
        onClose={() => setPending(null)}
      />
    </div>
  )
}
