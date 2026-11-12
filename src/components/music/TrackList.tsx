import { Play } from 'lucide-react'
import { useMusicPlayer } from '../../context/MusicPlayerContext'
import type { Album } from '../../types'
import { cn } from '../../utils/cn'
import { formatDuration } from '../../utils/format'

interface TrackListProps {
  album: Album
  dense?: boolean
  className?: string
  showHeader?: boolean
}

export const TrackList = ({ album, dense = false, className, showHeader = true }: TrackListProps) => {
  const { playAlbum, isPlaying, toggle, isCurrent } = useMusicPlayer()

  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="mb-2 grid grid-cols-[26px_1fr_auto_auto] items-center gap-4 border-b border-white/10 px-1 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted sm:grid-cols-[32px_1fr_120px_44px]">
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="hidden sm:block">Artist</span>
          <span className="text-right">Time</span>
        </div>
      )}
      <ul>
        {album.tracks.map((track, index) => {
          const active = isCurrent(track.id)
          const playing = active && isPlaying
          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => (active ? toggle() : playAlbum(album, index))}
                className={cn(
                  'group grid w-full grid-cols-[26px_1fr_auto_auto] items-center gap-4 rounded-lg px-1 text-left transition-colors hover:bg-white/[0.045] sm:grid-cols-[32px_1fr_120px_44px]',
                  dense ? 'py-2.5' : 'py-3',
                  active && 'bg-white/[0.03]',
                )}
                aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  {playing ? (
                    <span className="flex items-end gap-[2px]" aria-hidden>
                      {[0, 1, 2].map((bar) => (
                        <span
                          key={bar}
                          className="w-[2px] animate-pulse-dot rounded-full bg-accent"
                          style={{ height: `${6 + bar * 4}px`, animationDelay: `${bar * 0.18}s` }}
                        />
                      ))}
                    </span>
                  ) : (
                    <>
                      <span className="font-mono text-[11px] text-white/35 group-hover:opacity-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Play size={12} className="absolute fill-white text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </>
                  )}
                </span>

                <span className="min-w-0">
                  <span className={cn('block truncate text-[13px] font-medium', active ? 'text-accent-300' : 'text-white/90')}>
                    {track.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted sm:hidden">{track.artist}</span>
                  {track.lyricist && (
                    <span className="mt-0.5 hidden text-[9px] uppercase tracking-[0.12em] text-white/25 sm:block">
                      Lyrics · {track.lyricist}
                    </span>
                  )}
                </span>

                <span className="hidden truncate text-[11px] text-muted sm:block">{track.artist}</span>
                <span className="text-right font-mono text-[10px] tabular-nums text-white/40">
                  {formatDuration(track.duration)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[9px] uppercase tracking-[0.16em] text-white/30">
        <span>Demo audio · royalty-free placeholder tracks</span>
        <span>
          {album.tracks.length} tracks · {formatDuration(album.runtime)}
        </span>
      </div>
    </div>
  )
}
