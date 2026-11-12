import { Heart } from 'lucide-react'
import type { MouseEvent } from 'react'
import { toast } from 'react-toastify'
import { useWatchlist } from '../../context/WatchlistContext'
import { cn } from '../../utils/cn'

interface WatchlistButtonProps {
  movieId: string
  movieTitle: string
  variant?: 'icon' | 'label'
  className?: string
}

export const WatchlistButton = ({ movieId, movieTitle, variant = 'icon', className }: WatchlistButtonProps) => {
  const { isSaved, toggle } = useWatchlist()
  const saved = isSaved(movieId)

  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const added = toggle(movieId)
    toast[added ? 'success' : 'info'](
      added ? `Added “${movieTitle}” to your watchlist.` : `Removed “${movieTitle}” from your watchlist.`,
    )
  }

  if (variant === 'label') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${movieTitle} from watchlist` : `Add ${movieTitle} to watchlist`}
        className={cn('btn-ghost px-5 py-3 text-xs', saved && 'border-accent/40 bg-accent/10 text-white', className)}
      >
        <Heart size={15} className={saved ? 'fill-accent text-accent' : ''} />
        {saved ? 'In Watchlist' : 'Watchlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${movieTitle} from watchlist` : `Add ${movieTitle} to watchlist`}
      title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/80 backdrop-blur transition-all hover:border-white/40 hover:text-white',
        saved && 'border-accent/50 bg-accent/20 text-accent',
        className,
      )}
    >
      <Heart size={14} className={saved ? 'fill-accent' : ''} />
    </button>
  )
}
