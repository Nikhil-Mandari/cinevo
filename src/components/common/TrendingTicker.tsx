import { Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../types'

export const TrendingTicker = ({ movies }: { movies: Movie[] }) => {
  if (!movies.length) return null
  const items = [...movies, ...movies]

  return (
    <div className="relative flex items-center gap-4 overflow-hidden border-y border-white/10 bg-ink-925/80 py-3">
      <span className="z-10 ml-5 hidden shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-widest2 text-white sm:flex lg:ml-12">
        <Flame size={13} className="text-accent" />
        Trending
      </span>
      <div className="mask-fade-r relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap pr-8 hover:[animation-play-state:paused]">
          {items.map((movie, index) => (
            <Link
              key={`${movie.id}-${index}`}
              to={`/movies/${movie.id}`}
              className="group inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-white"
            >
              <span className="font-mono text-[9px] text-accent/80">
                {String((index % movies.length) + 1).padStart(2, '0')}
              </span>
              {movie.title}
              <span className="h-1 w-1 rounded-full bg-white/20 transition-colors group-hover:bg-accent" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
