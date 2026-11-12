import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, Music2, Play, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, formatRuntime } from '../../utils/format'
import { Countdown } from '../common/Countdown'
import { PosterArt } from '../common/PosterArt'
import { TrailerModal } from '../common/TrailerModal'
import { WatchlistButton } from './WatchlistButton'

interface UpcomingSpotlightProps {
  movie: Movie
  layout?: 'tall' | 'wide'
  index?: number
}

const DateBlock = ({ movie, className }: { movie: Movie; className?: string }) => {
  const date = new Date(`${movie.releaseDate}T00:00:00`)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-display text-3xl leading-none text-white">{String(date.getDate()).padStart(2, '0')}</span>
      <div className="leading-none">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
          {date.toLocaleDateString('en-IN', { month: 'short' })}
        </p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/40">{date.getFullYear()}</p>
      </div>
    </div>
  )
}

export const UpcomingSpotlight = ({ movie, layout = 'tall', index = 0 }: UpcomingSpotlightProps) => {
  const [trailerOpen, setTrailerOpen] = useState(false)
  const released = new Date(`${movie.releaseDate}T00:00:00`).getTime() <= Date.now()
  const target = `${movie.releaseDate}T09:00:00`

  if (layout === 'wide') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900"
      >
        <div className="grid gap-0 sm:grid-cols-[210px_1fr]">
          <div className="relative hidden min-h-[280px] overflow-hidden sm:block">
            <PosterArt movie={movie} size="md" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink-900/80" />
          </div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <DateBlock movie={movie} />
              <div className="flex items-center gap-2">
                <span className="date-chip">{movie.certificate}</span>
                <WatchlistButton movieId={movie.id} movieTitle={movie.title} />
              </div>
            </div>
            <h3 className="display-title mt-5 text-[clamp(2rem,4vw,3rem)] text-white">{movie.title}</h3>
            <p className="mt-1 font-serif text-sm italic text-white/50">{movie.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
              <span>{movie.genres.join(' / ')}</span>
              <span className="h-2.5 w-px bg-white/20" />
              <span>{movie.languages.join(', ')}</span>
              <span className="h-2.5 w-px bg-white/20" />
              <span>{formatRuntime(movie.runtime)}</span>
            </div>
            <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-fog/70">{movie.synopsis}</p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={() => setTrailerOpen(true)} className="btn-ghost px-4 py-2.5 text-[11px]">
                  <Play size={13} className="fill-white" />
                  Trailer
                </button>
                <Link to={`/music/album/${movie.id}`} className="btn-ghost px-4 py-2.5 text-[11px]">
                  <Music2 size={13} />
                  Music
                </Link>
                <Link to={`/movies/${movie.id}`} className="btn-ghost px-4 py-2.5 text-[11px]">
                  Details
                  <ArrowUpRight size={13} />
                </Link>
                <Link
                  to={`/book/${movie.id}`}
                  className="btn bg-white px-4 py-2.5 text-[11px] text-ink-950 hover:bg-white/85"
                >
                  <Ticket size={13} />
                  {released ? 'Book Tickets' : 'Booking Opens'}
                </Link>
              </div>
              <Countdown target={target} variant="inline" label={released ? '' : 'Releasing in'} />
            </div>
          </div>
        </div>
        <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={movie.title} trailerUrl={movie.trailerUrl} />
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative min-h-[440px] overflow-hidden rounded-2xl border border-white/12 bg-ink-900 sm:min-h-[500px]"
    >
      <PosterArt movie={movie} size="hero" bare className="absolute inset-0 transition-transform duration-[1200ms] ease-smooth group-hover:scale-105" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.25)_0%,rgba(8,8,8,0.15)_35%,rgba(8,8,8,0.88)_78%,#080808_100%)]" />

      <div className="relative flex h-full min-h-[440px] flex-col justify-between p-5 sm:min-h-[500px] sm:p-6">
        <div className="flex items-start justify-between">
          <span className="rounded-sm border border-white/20 bg-black/35 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
            {released ? 'Now Showing' : 'Upcoming'}
          </span>
          <WatchlistButton movieId={movie.id} movieTitle={movie.title} className="opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <DateBlock movie={movie} />
            <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-white/50">
              <CalendarDays size={11} />
              {formatDate(movie.releaseDate)}
            </span>
          </div>

          <h3 className="display-title max-w-[14ch] text-[clamp(2.1rem,3.4vw,2.9rem)] text-white">{movie.title}</h3>
          <p className="mt-1.5 font-serif text-[13px] italic text-white/55">{movie.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1 text-[9px] uppercase tracking-[0.16em] text-white/45">
            <span>{movie.genres.slice(0, 2).join(' / ')}</span>
            <span>·</span>
            <span>{movie.languages[0]}</span>
            <span>·</span>
            <span>{formatRuntime(movie.runtime)}</span>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <Countdown target={target} variant="compact" label={released ? 'In cinemas' : 'Releasing in'} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link to={`/book/${movie.id}`} className="btn bg-white px-4 py-2.5 text-[11px] text-ink-950 hover:bg-white/85">
              <Ticket size={13} />
              Book
            </Link>
            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              className="btn border border-white/25 bg-white/5 px-3.5 py-2.5 text-[11px] text-white backdrop-blur hover:bg-white/10"
              aria-label={`Watch ${movie.title} trailer`}
            >
              <Play size={12} className="fill-white" />
              Trailer
            </button>
            <Link
              to={`/music/album/${movie.id}`}
              aria-label={`Listen to ${movie.title} songs`}
              className="btn border border-white/25 bg-white/5 px-3.5 py-2.5 text-[11px] text-white backdrop-blur hover:bg-white/10"
            >
              <Music2 size={12} />
              Music
            </Link>
            <Link
              to={`/movies/${movie.id}`}
              aria-label={`View ${movie.title} details`}
              className="btn border border-white/25 bg-white/5 px-3 py-2.5 text-[11px] text-white backdrop-blur hover:bg-white/10"
            >
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={movie.title} trailerUrl={movie.trailerUrl} />
    </motion.article>
  )
}
