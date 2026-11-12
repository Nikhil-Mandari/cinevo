import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock3, Search, TrendingUp, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync'
import { TRENDING_SEARCHES } from '../../data/community'
import { movieService } from '../../services/movieService'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/format'
import { STORAGE_KEYS, readJSON, writeJSON } from '../../utils/storage'
import { PosterArt } from '../common/PosterArt'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export const saveRecentSearch = (term: string): void => {
  const clean = term.trim()
  if (!clean) return
  const existing = readJSON<string[]>(STORAGE_KEYS.recentSearches, [])
  const next = [clean, ...existing.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6)
  writeJSON(STORAGE_KEYS.recentSearches, next)
}

const ResultRow = ({ movie, onPick }: { movie: Movie; onPick: (movie: Movie) => void }) => (
  <button
    type="button"
    onClick={() => onPick(movie)}
    className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
  >
    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded">
      <PosterArt movie={movie} size="sm" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm text-white">{movie.title}</span>
      <span className="mt-0.5 block truncate text-[10px] text-muted">
        {movie.genres.slice(0, 2).join(' · ')} · {movie.languages.join(', ')} · {formatDate(movie.releaseDate, { year: 'numeric' })}
      </span>
    </span>
    <ArrowRight size={13} className="shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/70" />
  </button>
)

export const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [term, setTerm] = useState('')
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setRecent(readJSON<string[]>(STORAGE_KEYS.recentSearches, []))
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setTerm('')
    }
  }, [open])

  useEffect(() => {
    const timer = window.setTimeout(() => setTerm(query.trim()), 160)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data, loading } = useAsync(
    () => (term ? movieService.list({ query: term }) : Promise.resolve([])),
    [term],
  )
  const results = (data ?? []).slice(0, 6)

  const submit = (value: string) => {
    const clean = value.trim()
    if (!clean) return
    saveRecentSearch(clean)
    onClose()
    navigate(`/search?q=${encodeURIComponent(clean)}`)
  }

  const pick = (movie: Movie) => {
    saveRecentSearch(movie.title)
    onClose()
    navigate(`/movies/${movie.id}`)
  }

  const applyTerm = (value: string) => {
    setQuery(value)
    inputRef.current?.focus()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] overflow-y-auto bg-ink-950/92 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search CINÉVO"
        >
          <div className="container-page py-5 sm:py-10">
            <div className="mx-auto max-w-2xl">
              <div className="mb-8 flex items-center justify-between">
                <p className="eyebrow flex items-center gap-2">
                  <Search size={12} className="text-accent" /> Search CINÉVO
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-white/30 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  submit(query)
                }}
              >
                <div className="flex items-center gap-3 border-b border-white/20 pb-3 focus-within:border-accent">
                  <Search size={20} className="shrink-0 text-white/40" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Movies, genres, languages, actors…"
                    aria-label="Search movies"
                    className="w-full bg-transparent text-lg text-white placeholder:text-white/25 sm:text-2xl"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="text-white/30 hover:text-white">
                      <X size={17} />
                    </button>
                  )}
                </div>
              </form>

              {term ? (
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                      {loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'} for “${term}”`}
                    </p>
                  </div>
                  {!loading && results.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
                      <p className="text-sm text-white">No titles matched “{term}”.</p>
                      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
                        Try a title, a genre like “thriller”, a language, or an actor’s name. The catalog is sample data.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {results.map((movie) => (
                        <ResultRow key={movie.id} movie={movie} onPick={pick} />
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => submit(term)}
                    className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-xs text-white/70 transition-colors hover:border-white/25 hover:text-white"
                  >
                    View all results for “{term}” <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-8">
                  {recent.length > 0 && (
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
                        <Clock3 size={11} /> Recent searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => applyTerm(item)}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
                      <TrendingUp size={11} /> Trending in Hyderabad
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {TRENDING_SEARCHES.map((item, index) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => applyTerm(item)}
                          className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-white/10 hover:bg-white/[0.03]"
                        >
                          <span className={cn('font-mono text-[10px]', index < 3 ? 'text-accent' : 'text-white/20')}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-sm text-white/75 group-hover:text-white">{item}</span>
                          <ArrowRight size={12} className="text-white/15 group-hover:text-white/60" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-[10px] leading-relaxed text-white/35">
                      Search runs entirely against CINÉVO’s local sample catalog. Artwork uses remote demo images.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                <span>Enter to search all results · Esc to close</span>
                <Link to="/explore" onClick={onClose} className="hover:text-white/60">
                  Browse everything
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
