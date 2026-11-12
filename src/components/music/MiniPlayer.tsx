import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMusicPlayer } from '../../context/MusicPlayerContext'
import { cn } from '../../utils/cn'
import { formatDuration, toneMix } from '../../utils/format'

const ProgressBar = ({ className }: { className?: string }) => {
  const { current, currentTime, duration, seek } = useMusicPlayer()
  if (!current) return null
  const total = duration || current.duration || 1
  const percent = Math.min(100, (currentTime / total) * 100)
  return (
    <input
      type="range"
      min={0}
      max={total}
      step={0.5}
      value={Math.min(currentTime, total)}
      onChange={(event) => seek(Number(event.target.value))}
      aria-label="Seek track"
      className={cn('h-1 w-full cursor-pointer appearance-none rounded-full', className)}
      style={{
        background: `linear-gradient(to right, #E50914 0%, #E50914 ${percent}%, rgba(255,255,255,0.16) ${percent}%, rgba(255,255,255,0.16) 100%)`,
      }}
    />
  )
}

export const MiniPlayer = () => {
  const {
    current,
    queue,
    isPlaying,
    isLoading,
    error,
    currentTime,
    duration,
    volume,
    muted,
    repeat,
    toggle,
    next,
    previous,
    playTrack,
    setVolume,
    toggleMute,
    toggleRepeat,
    close,
  } = useMusicPlayer()
  const [expanded, setExpanded] = useState(false)

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ y: 110 }}
          animate={{ y: 0 }}
          exit={{ y: 110 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-ink-925/95 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          role="region"
          aria-label="Music player"
        >
          <div className="absolute inset-x-0 top-0 sm:hidden">
            <ProgressBar className="h-[2px] rounded-none" />
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden border-b border-white/10"
              >
                <div className="container-page grid gap-6 py-6 md:grid-cols-[180px_1fr]">
                  <div
                    className="relative hidden aspect-square overflow-hidden rounded-lg border border-white/10 md:block"
                    style={{ background: toneMix(current.tone) }}
                  >
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      <span className="text-[8px] uppercase tracking-[0.24em] text-white/60">Now Playing</span>
                      <div>
                        <p className="display-title text-xl leading-tight text-white">{current.movieTitle}</p>
                        <p className="mt-1 text-[10px] text-white/60">{current.artist}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                        <ListMusic size={13} />
                        Up next · {queue.length} tracks
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        className="text-muted hover:text-white"
                        aria-label="Collapse player"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <ul className="max-h-44 overflow-y-auto pr-1">
                      {queue.map((track, index) => {
                        const active = track.id === current.id
                        return (
                          <li key={track.id}>
                            <button
                              type="button"
                              onClick={() => playTrack(track, queue)}
                              className={cn(
                                'flex w-full items-center justify-between gap-4 rounded-md px-2 py-2 text-left text-xs transition-colors hover:bg-white/5',
                                active ? 'text-accent-300' : 'text-white/70',
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className="w-5 shrink-0 font-mono text-[10px] text-white/30">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate">{track.title}</span>
                                  <span className="block truncate text-[10px] text-white/35">{track.artist}</span>
                                </span>
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-white/30">
                                {formatDuration(track.duration)}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="container-page flex h-[66px] items-center gap-3 sm:h-[76px] sm:gap-5">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/15 sm:h-12 sm:w-12"
              style={{ background: toneMix(current.tone) }}
              aria-label={expanded ? 'Collapse now playing' : 'Expand now playing'}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-base uppercase text-white/90">{current.movieTitle.charAt(0)}</span>
              </span>
              <span className="absolute inset-0 bg-black/10" />
            </button>

            <div className="min-w-0 flex-1 sm:max-w-[240px]">
              <div className="flex items-center gap-2">
                <Link
                  to={`/music/album/${current.movieId}`}
                  className="truncate text-[13px] font-medium text-white hover:text-accent-300"
                >
                  {current.title}
                </Link>
                {current.isDemo && (
                  <span className="hidden shrink-0 rounded-sm border border-white/15 px-1 py-0.5 text-[7px] uppercase tracking-[0.14em] text-white/40 sm:inline">
                    Demo
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[10px] text-muted">
                {current.artist} · {current.movieTitle}
              </p>
              {error && (
                <p className="mt-0.5 truncate text-[9px] text-accent-300" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={previous}
                aria-label="Previous track"
                className="hidden h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white sm:flex"
              >
                <SkipBack size={16} />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-950 transition-transform hover:scale-105 active:scale-95"
              >
                {isLoading && !isPlaying ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                ) : isPlaying ? (
                  <Pause size={15} className="fill-ink-950" />
                ) : (
                  <Play size={15} className="ml-0.5 fill-ink-950" />
                )}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next track"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white"
              >
                <SkipForward size={16} />
              </button>
            </div>

            <div className="hidden flex-1 items-center gap-3 sm:flex">
              <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular-nums text-white/40">
                {formatDuration(currentTime)}
              </span>
              <ProgressBar className="flex-1" />
              <span className="w-8 shrink-0 font-mono text-[10px] tabular-nums text-white/40">
                {formatDuration(duration || current.duration)}
              </span>
            </div>

            <div className="hidden items-center gap-1.5 lg:flex">
              <button
                type="button"
                onClick={toggleRepeat}
                aria-label="Toggle repeat"
                aria-pressed={repeat}
                className={cn('flex h-8 w-8 items-center justify-center rounded-full', repeat ? 'text-accent' : 'text-white/45 hover:text-white')}
              >
                <Repeat size={14} />
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/45 hover:text-white"
              >
                {muted ? <VolumeX size={15} /> : volume > 0.5 ? <Volume2 size={15} /> : <Volume1 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume"
                className="h-1 w-20 cursor-pointer rounded-full"
                style={{
                  background: `linear-gradient(to right, #ffffff ${((muted ? 0 : volume) * 100).toFixed(0)}%, rgba(255,255,255,0.16) ${((muted ? 0 : volume) * 100).toFixed(0)}%, rgba(255,255,255,0.16) 100%)`,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-label={expanded ? 'Collapse player' : 'Expand player'}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-white/35 hover:text-white md:flex"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close player"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
