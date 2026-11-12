import { Share2 } from 'lucide-react'
import { toast } from 'react-toastify'
import type { Movie } from '../../types'
import { cn } from '../../utils/cn'

export const ShareButton = ({
  movie,
  variant = 'label',
  className,
}: {
  movie: Pick<Movie, 'id' | 'title'>
  variant?: 'label' | 'icon'
  className?: string
}) => {
  const handleShare = async () => {
    const url = `${window.location.origin}/movies/${movie.id}`
    const payload = {
      title: `${movie.title} · CINÉVO`,
      text: `Feeling the cinema with ${movie.title} on CINÉVO.`,
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(payload)
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Link copied. Share the cinema.')
    } catch (reason) {
      if (reason instanceof Error && reason.name === 'AbortError') return
      toast.info(url)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share ${movie.title}`}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-white/30 hover:text-white',
          className,
        )}
      >
        <Share2 size={15} />
      </button>
    )
  }

  return (
    <button type="button" onClick={handleShare} className={cn('btn-ghost px-5 py-3 text-xs', className)}>
      <Share2 size={15} />
      Share
    </button>
  )
}
