import { motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMusicPlayer } from '../../context/MusicPlayerContext'
import type { Album } from '../../types'
import { cn } from '../../utils/cn'
import { AlbumArtwork } from './AlbumArtwork'

export const AlbumCard = ({ album, index = 0, className }: { album: Album; index?: number; className?: string }) => {
  const { playAlbum, current, isPlaying, toggle } = useMusicPlayer()
  const playingThis = current?.albumId === album.id && isPlaying

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      className={cn('group', className)}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-850 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-white/25">
        <Link to={`/music/album/${album.movieId}`} className="block" aria-label={`Open ${album.title}`}>
          <AlbumArtwork album={album} />
        </Link>
        <button
          type="button"
          onClick={() => (playingThis ? toggle() : playAlbum(album))}
          aria-label={playingThis ? `Pause ${album.title}` : `Play ${album.title}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-accent text-white opacity-0 shadow-lg transition-all duration-300 hover:bg-accent-400 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          {playingThis ? <Pause size={15} className="fill-white" /> : <Play size={15} className="ml-0.5 fill-white" />}
        </button>
      </div>
      <div className="mt-3">
        <Link to={`/music/album/${album.movieId}`} className="block truncate font-display text-sm uppercase tracking-wide text-white/95 hover:text-white">
          {album.movieTitle} · Soundtrack
        </Link>
        <p className="mt-1 truncate text-[11px] text-muted">
          {album.artist} · {album.tracks.length} tracks
        </p>
      </div>
    </motion.article>
  )
}
