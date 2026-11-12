import { useState } from 'react'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'
import { toneMix } from '../../utils/format'

interface PosterArtProps {
  movie: Pick<Movie, 'title' | 'tone' | 'genres' | 'tagline' | 'releaseDate' | 'posterUrl'>
  size?: 'sm' | 'md' | 'lg' | 'hero'
  className?: string
  priority?: boolean
  /** Hides the typographic title block for use as a background layer. */
  bare?: boolean
}

const TITLE_SIZE: Record<NonNullable<PosterArtProps['size']>, string> = {
  sm: 'text-[1.35rem]',
  md: 'text-[1.9rem]',
  lg: 'text-[clamp(2rem,4vw,3.25rem)]',
  hero: 'text-[clamp(2.5rem,5vw,4.5rem)]',
}

const PADDING: Record<NonNullable<PosterArtProps['size']>, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  hero: 'p-8',
}

/**
 * Poster artwork uses the optional remote demo image when available and keeps
 * the generated composition as a fallback if that image cannot be loaded.
 */
export const PosterArt = ({ movie, size = 'md', className, priority, bare = false }: PosterArtProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const year = movie.releaseDate.slice(0, 4)
  const showImage = Boolean(movie.posterUrl) && !imageFailed

  return (
    <div
      className={cn('grain relative isolate h-full w-full overflow-hidden bg-ink-850', className)}
      aria-label={`${movie.title} poster artwork`}
      role="img"
    >
      <div className="absolute inset-0" style={{ background: toneMix(movie.tone) }} />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(75% 55% at 72% 18%, ${movie.tone.glow}55 0%, transparent 62%)`,
        }}
      />
      <div className="absolute -right-10 top-1/4 h-[120%] w-[55%] rotate-[18deg] bg-white/[0.035] blur-[1px]" />
      <div className="absolute -left-1/3 top-[12%] h-[1px] w-[150%] -rotate-[24deg] bg-white/20" />
      <div className="absolute -left-1/4 top-[22%] h-[1px] w-[150%] -rotate-[24deg] bg-white/[0.07]" />

      {showImage && (
        <img
          src={movie.posterUrl ?? ''}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <span
        aria-hidden
        className="pointer-events-none absolute -right-[0.16em] top-[8%] select-none font-display text-[13rem] leading-none text-white/[0.055] mix-blend-overlay"
      >
        {movie.title.charAt(0)}
      </span>

      <div className={cn('relative flex h-full flex-col justify-between', PADDING[size], bare && 'invisible')}>
        <div className="flex items-start justify-between text-[8px] font-semibold uppercase tracking-[0.28em] text-white/60">
          <span>CINÉVO</span>
          <span>{year}</span>
        </div>

        <div className="relative">
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/70">
            <span>{movie.genres.slice(0, 2).join(' / ')}</span>
          </div>
          <h3
            className={cn(
              'display-title max-w-[95%] text-balance text-white drop-shadow-[0_6px_30px_rgba(0,0,0,0.45)]',
              TITLE_SIZE[size],
            )}
          >
            {movie.title}
          </h3>
          <span className="mt-3 block h-px w-10 bg-accent" />
          {movie.tagline && size !== 'sm' && (
            <p className="mt-2.5 line-clamp-2 max-w-[92%] font-serif text-[11px] italic leading-snug text-white/70">
              {movie.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
    </div>
  )
}

/**
 * Full-bleed cinematic backdrop used behind hero sections and detail pages.
 */
export const BackdropArt = ({
  movie,
  className,
}: {
  movie: Pick<Movie, 'title' | 'tone' | 'tagline' | 'posterUrl'>
  className?: string
}) => {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(movie.posterUrl) && !imageFailed

  return (
    <div className={cn('grain absolute inset-0 overflow-hidden bg-ink-950', className)} aria-hidden>
      <div className="absolute inset-0" style={{ background: toneMix(movie.tone) }} />
      {showImage && (
        <img
          src={movie.posterUrl ?? ''}
          alt=""
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60"
        />
      )}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(65% 75% at 68% 30%, ${movie.tone.glow}44 0%, transparent 65%)`,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="absolute -left-1/4 top-[30%] h-px w-[160%] -rotate-[16deg] bg-white/[0.12]" />
      <div className="absolute -left-1/4 top-[36%] h-px w-[160%] -rotate-[16deg] bg-white/[0.05]" />
      <span className="absolute -right-8 top-[6%] select-none whitespace-nowrap font-display text-[22vw] uppercase leading-none text-white/[0.045]">
        {movie.title.split(' ')[0]}
      </span>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.94)_0%,rgba(8,8,8,0.55)_45%,rgba(8,8,8,0.25)_75%,rgba(8,8,8,0.7)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/80" />
    </div>
  )
}
