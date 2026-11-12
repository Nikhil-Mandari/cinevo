import { Bookmark, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { MovieCard } from '../components/movie/MovieCard'
import { useWatchlist } from '../context/WatchlistContext'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import type { Movie } from '../types'

export const WatchlistPage = () => {
  const { ids, clear } = useWatchlist()
  const { data: movies, loading } = useAsync(() => movieService.list(), [])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const saved = ids
    .map((id) => movies?.find((movie) => movie.id === id))
    .filter((movie): movie is Movie => Boolean(movie))

  const handleClear = () => {
    clear()
    setConfirmOpen(false)
    toast.info('Watchlist cleared. Saved films live in this browser only.')
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Your shelf
          </p>
          <h1 className="display-title text-[clamp(2.4rem,5vw,4.4rem)] text-white">Watchlist</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Films you saved with the bookmark button. Nothing here is sent anywhere — the list is stored in this
            browser and survives a refresh.
          </p>
        </div>
        {saved.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="btn-ghost w-fit px-4 py-2.5 text-[11px]"
          >
            <Trash2 size={13} /> Clear watchlist
          </button>
        )}
      </div>

      <p className="mt-6 flex items-center gap-1.5 border-y border-white/10 py-3 text-[10px] uppercase tracking-[0.16em] text-white/35">
        <Bookmark size={11} className="text-accent" /> {ids.length} saved title{ids.length === 1 ? '' : 's'}
        {ids.length > saved.length && ' · some titles are missing from the catalog'}
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Shimmer key={index} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : saved.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {saved.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} showStatus />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved yet"
            description="Tap the bookmark on any film to keep it here for later. Demo entries are stored in your browser."
            actionLabel="Browse the catalog"
            actionHref="/explore"
          />
        )}
      </div>

      <p className="mt-10 text-[10px] leading-relaxed text-white/25">
        Saved films are not synced to an account in this frontend build. Signing in does not change the local
        watchlist. <Link to="/login" className="text-white/50 underline-offset-4 hover:text-white hover:underline">Sign in</Link> to
        keep tickets and community posts alongside it.
      </p>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear the watchlist?"
        message="Every saved film is removed from this browser. This cannot be undone, but you can bookmark titles again at any time."
        confirmLabel="Clear watchlist"
        busy={false}
        onConfirm={handleClear}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
