import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Info, Music2, Play, Ticket } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, formatRuntime } from '../../utils/format'
import { Countdown } from '../common/Countdown'
import { BackdropArt, PosterArt } from '../common/PosterArt'
import { TrailerModal } from '../common/TrailerModal'

const SLIDE_MS = 9000

export const HeroCarousel = ({ movies }: { movies: Movie[] }) => {
  const [active, setActive] = useState(0)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [paused, setPaused] = useState(false)

  const go = useCallback(
    (direction: 1 | -1) => {
      setActive((current) => (current + direction + movies.length) % movies.length)
    },
    [movies.length],
  )

  useEffect(() => {
    if (paused || trailerOpen || movies.length < 2) return
    const id = window.setInterval(() => go(1), SLIDE_MS)
    return () => window.clearInterval(id)
  }, [paused, trailerOpen, go, movies.length, active])

  if (!movies.length) return null
  const movie = movies[active]
  const released = new Date(`${movie.releaseDate}T00:00:00`).getTime() <= Date.now()

  return (
    <section
      className="relative min-h-[88svh] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured films"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={movie.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <BackdropArt movie={movie} />
        </motion.div>
      </AnimatePresence>

      <div className="relative container-page flex min-h-[88svh] flex-col justify-end pb-12 pt-32 sm:pb-16 lg:pb-20 lg:pt-40">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="date-chip border-accent/30 bg-accent/10 text-white">
                    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
                    {released ? 'Now in cinemas' : `In cinemas ${formatDate(movie.releaseDate)}`}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest2 text-white/50">
                    CINÉVO Feature · {String(active + 1).padStart(2, '0')}
                  </span>
                </div>

                <h1 className="display-title max-w-[15ch] text-[clamp(3.1rem,7.2vw,6.8rem)] text-glow">
                  {movie.title}
                </h1>

                <p className="mt-4 max-w-xl font-serif text-base italic leading-snug text-white/65 sm:text-lg">
                  {movie.tagline}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-white/60">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={12} className="text-white/40" />
                    {formatDate(movie.releaseDate)}
                  </span>
                  <span className="h-3 w-px bg-white/20" />
                  <span>{movie.certificate}</span>
                  <span className="h-3 w-px bg-white/20" />
                  <span>{formatRuntime(movie.runtime)}</span>
                  <span className="h-3 w-px bg-white/20" />
                  <span>{movie.languages.join(' · ')}</span>
                  <span className="h-3 w-px bg-white/20" />
                  <span>{movie.genres.slice(0, 2).join(' / ')}</span>
                </div>

                <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-fog/80 sm:text-[15px]">
                  {movie.synopsis}
                </p>

                {!released && (
                  <Countdown target={`${movie.releaseDate}T19:00:00`} variant="hero" className="mt-6" />
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link to={`/book/${movie.id}`} className="btn-primary px-6 py-3.5 text-[13px]">
                    <Ticket size={16} />
                    Book Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={() => setTrailerOpen(true)}
                    className="btn-ghost px-5 py-3.5 text-[13px]"
                  >
                    <Play size={15} className="fill-white" />
                    Watch Trailer
                  </button>
                  <Link
                    to={`/music/album/${movie.id}`}
                    className="link-underline group ml-1 px-1 py-3 text-[12px] uppercase tracking-[0.14em]"
                  >
                    <Music2 size={14} className="text-accent" />
                    Listen to Songs
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex items-center gap-3">
                {movies.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`Show ${item.title}`}
                    aria-current={index === active}
                    className={cn(
                      'group flex flex-col gap-2 text-left',
                    )}
                  >
                    <span
                      className={cn(
                        'h-[2px] overflow-hidden rounded-full bg-white/20 transition-all duration-500',
                        index === active ? 'w-12 bg-white/20' : 'w-5 group-hover:bg-white/40',
                      )}
                    >
                      {index === active && (
                        <motion.span
                          key={`${movie.id}-bar`}
                          className="block h-full bg-accent"
                          initial={{ width: paused ? '100%' : '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: paused ? 0.3 : SLIDE_MS / 1000, ease: 'linear' }}
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[9px] tracking-[0.2em]',
                        index === active ? 'text-white' : 'text-white/35',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous featured film"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next featured film"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <motion.div
            key={`poster-${movie.id}`}
            initial={{ opacity: 0, y: 26, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div
              className="absolute -inset-8 opacity-60 blur-3xl"
              style={{ background: `radial-gradient(50% 50% at 50% 50%, ${movie.tone.glow}66, transparent 70%)` }}
              aria-hidden
            />
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/15 shadow-[0_50px_120px_-30px_rgba(0,0,0,1)]">
              <PosterArt movie={movie} size="lg" priority />
            </div>
            <div className="absolute -bottom-5 -left-8 rounded-lg border border-white/10 bg-ink-900/90 px-4 py-3 backdrop-blur-md">
              <p className="text-[8px] uppercase tracking-[0.2em] text-muted">Audience score</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-xl text-white">{movie.audienceScore}%</span>
                <span className="text-[8px] uppercase tracking-wider text-muted">sample</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/35 lg:mt-12">
          <Info size={11} />
          Demo catalog · remote demo artwork · placeholder soundtrack audio
        </div>
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={movie.title}
        trailerUrl={movie.trailerUrl}
      />
    </section>
  )
}
