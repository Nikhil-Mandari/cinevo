import { motion } from 'framer-motion'
import { CalendarDays, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, formatRuntime } from '../../utils/format'
import { PosterArt } from '../common/PosterArt'
import { WatchlistButton } from './WatchlistButton'

interface MovieCardProps {
  movie: Movie
  index?: number
  className?: string
  showStatus?: boolean
}

export const MovieCard = ({ movie, index = 0, className, showStatus = false }: MovieCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.32), ease: [0.22, 1, 0.36, 1] }}
    className={cn('group relative', className)}
  >
    <Link to={`/movies/${movie.id}`} className="block focus-visible:rounded-xl">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-ink-850 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition-all duration-500 ease-smooth group-hover:-translate-y-1.5 group-hover:border-white/25 group-hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.95)]">
        <div className="h-full w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.045]">
          <PosterArt movie={movie} size="sm" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {movie.status === 'coming-soon' && (
            <span className="rounded-sm bg-black/60 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              Coming Soon
            </span>
          )}
          {showStatus && movie.status === 'now-showing' && (
            <span className="flex items-center gap-1.5 rounded-sm bg-black/60 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-accent" /> In Cinemas
            </span>
          )}
        </div>

        <WatchlistButton
          movieId={movie.id}
          movieTitle={movie.title}
          className="absolute right-2.5 top-2.5 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus:opacity-100"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 px-3.5 pb-3.5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/65">
              {movie.languages[0]} · {formatRuntime(movie.runtime)}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
              <Star size={10} className="fill-accent text-accent" />
              {(movie.audienceScore / 10).toFixed(1)}
            </span>
          </div>
          <span className="mt-2 flex h-7 w-full items-center justify-center rounded-full border border-white/25 bg-white/10 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            View film
          </span>
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="truncate font-display text-[15px] uppercase tracking-[0.01em] text-white/95 transition-colors group-hover:text-white">
          {movie.title}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-muted">
          <span className="truncate">{movie.genres.slice(0, 2).join(' · ')}</span>
        </p>
        {movie.status === 'coming-soon' && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/45">
            <CalendarDays size={10} />
            {formatDate(movie.releaseDate)}
          </p>
        )}
      </div>
    </Link>
  </motion.article>
)
