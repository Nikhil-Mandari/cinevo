import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { MovieCard } from '../components/movie/MovieCard'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import type { SearchFilters } from '../types'
import { cn } from '../utils/cn'

const GENRES = [
  'Action',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Historical',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
]

const LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Kannada']

const SORTS: Array<{ value: NonNullable<SearchFilters['sort']>; label: string }> = [
  { value: 'popularity', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'release', label: 'Newest' },
  { value: 'title', label: 'A–Z' },
]

export const ExplorePage = () => {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const genre = params.get('genre') ?? 'all'
  const language = params.get('language') ?? 'all'
  const status = (params.get('status') ?? 'all') as NonNullable<SearchFilters['status']>
  const sort = (params.get('sort') ?? 'popularity') as NonNullable<SearchFilters['sort']>

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const filters: SearchFilters = {
    query: query || undefined,
    genre,
    language,
    status,
    sort,
  }

  const { data, loading, error } = useAsync(() => movieService.list(filters), [query, genre, language, status, sort])
  const movies = data ?? []
  const activeCount = [query, genre !== 'all' ? genre : '', language !== 'all' ? language : '', status !== 'all' ? status : ''].filter(Boolean).length

  const reset = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(60% 120% at 85% 0%, rgba(122,45,22,0.35), transparent 65%), linear-gradient(180deg, #101010, #080808)' }}
          aria-hidden
        />
        <div className="container-page relative pb-10 pt-14 sm:pb-12 sm:pt-16">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> The catalog
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="display-title text-[clamp(2.8rem,6vw,5.6rem)] text-white">
                Explore <span className="serif-accent normal-case text-accent-300">every frame</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
                Twenty-two sample films across languages and moods. Filter the demo catalog, then follow any title into
                its detail page, soundtrack or booking flow.
              </p>
            </div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-accent" />
              {loading ? 'Reading catalog…' : `${movies.length} title${movies.length === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(event) => update('q', event.target.value)}
                placeholder="Search titles, cast, directors, genres…"
                aria-label="Search the catalog"
                className="field py-3.5 pl-11 pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => update('q', '')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="language-filter">
                Language
              </label>
              <select
                id="language-filter"
                value={language}
                onChange={(event) => update('language', event.target.value)}
                className="field w-auto min-w-[132px] cursor-pointer py-3 pr-8 text-xs"
              >
                <option value="all">All languages</option>
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="status-filter">
                Status
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={(event) => update('status', event.target.value)}
                className="field w-auto min-w-[132px] cursor-pointer py-3 pr-8 text-xs"
              >
                <option value="all">Any status</option>
                <option value="now-showing">Now showing</option>
                <option value="coming-soon">Coming soon</option>
              </select>

              <label className="sr-only" htmlFor="sort-filter">
                Sort
              </label>
              <select
                id="sort-filter"
                value={sort}
                onChange={(event) => update('sort', event.target.value)}
                className="field w-auto min-w-[132px] cursor-pointer py-3 pr-8 text-xs"
              >
                {SORTS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => update('genre', 'all')}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors',
                genre === 'all'
                  ? 'border-accent bg-accent/15 text-white'
                  : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white',
              )}
            >
              All genres
            </button>
            {GENRES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => update('genre', item)}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors',
                  genre === item
                    ? 'border-accent bg-accent/15 text-white'
                    : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white',
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {(activeCount > 0 || sort !== 'popularity') && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-white/40">
              <SlidersHorizontal size={12} /> {activeCount} active filter{activeCount === 1 ? '' : 's'}
              <button type="button" onClick={reset} className="ml-1 inline-flex items-center gap-1 text-accent-300 hover:text-white">
                Reset all <X size={11} />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-10 sm:py-12">
        {error && (
          <div className="surface mb-6 border-accent/30 p-4 text-xs text-accent-200" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index}>
                <Shimmer className="aspect-[2/3] rounded-xl" />
                <Shimmer className="mt-3 h-4 w-3/4 rounded" />
                <Shimmer className="mt-2 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : movies.length ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">
                Showing <span className="text-white">{movies.length}</span> of 22 sample titles
                {status !== 'all' ? ` · ${status === 'now-showing' ? 'Now showing' : 'Coming soon'}` : ''}
                {language !== 'all' ? ` · ${language}` : ''}
              </p>
              <Link to="/coming-soon" className="link-underline text-[11px]">
                Release calendar
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {movies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} showStatus />
              ))}
            </div>
            <p className="mt-12 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
              Catalog, scores and metadata are sample data. Poster artwork uses remote demo images.
            </p>
          </>
        ) : (
          <EmptyState
            icon={Search}
            title="No films in this frame"
            description="Nothing matches this combination of filters. Try a different genre, language or search term."
            actionLabel="Reset filters"
            onAction={reset}
          />
        )}
      </section>
    </div>
  )
}
