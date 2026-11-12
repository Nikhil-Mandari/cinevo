import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'
import { SectionHeading } from '../common/SectionHeading'
import { MovieCard } from './MovieCard'

interface MovieRailProps {
  title: string
  eyebrow?: string
  description?: string
  movies: Movie[]
  href?: string
  actionLabel?: string
  size?: 'default' | 'wide'
  showStatus?: boolean
  className?: string
}

export const MovieRail = ({
  title,
  eyebrow,
  description,
  movies,
  href,
  actionLabel = 'Explore all',
  size = 'default',
  showStatus,
  className,
}: MovieRailProps) => {
  const scroller = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateBounds = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setAtStart(el.scrollLeft <= 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    updateBounds()
    const el = scroller.current
    if (!el) return
    el.addEventListener('scroll', updateBounds, { passive: true })
    window.addEventListener('resize', updateBounds)
    return () => {
      el.removeEventListener('scroll', updateBounds)
      window.removeEventListener('resize', updateBounds)
    }
  }, [updateBounds, movies.length])

  const scroll = (direction: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.8, 920), behavior: 'smooth' })
  }

  if (!movies.length) return null

  return (
    <section className={cn('group/rail', className)}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} actionLabel={href ? actionLabel : undefined} actionHref={href} />

      <div className="relative">
        <div
          ref={scroller}
          className={cn(
            'no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12',
            size === 'wide' ? 'gap-5' : 'gap-4',
          )}
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              showStatus={showStatus}
              className={cn(
                'shrink-0 snap-start',
                size === 'wide' ? 'w-[220px] sm:w-[280px]' : 'w-[152px] sm:w-[190px] lg:w-[205px]',
              )}
            />
          ))}
          <span className="w-1 shrink-0" aria-hidden />
        </div>

        {!atStart && (
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${title} left`}
            className="absolute -left-3 top-[38%] hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/85 text-white backdrop-blur transition-all hover:border-white/40 hover:bg-ink-800 md:flex lg:-left-5"
          >
            <ChevronLeft size={17} />
          </button>
        )}
        {!atEnd && (
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${title} right`}
            className="absolute -right-3 top-[38%] hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/85 text-white backdrop-blur transition-all hover:border-white/40 hover:bg-ink-800 md:flex lg:-right-5"
          >
            <ChevronRight size={17} />
          </button>
        )}
      </div>
    </section>
  )
}
