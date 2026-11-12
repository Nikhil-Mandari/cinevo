import { ListMusic, Music2, Pause, Play, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { AlbumArtwork } from '../components/music/AlbumArtwork'
import { AlbumCard } from '../components/music/AlbumCard'
import { useMusicPlayer, type PlayerTrack } from '../context/MusicPlayerContext'
import { useAsync } from '../hooks/useAsync'
import { musicService } from '../services/musicService'
import { cn } from '../utils/cn'
import { formatDuration } from '../utils/format'

const LANGUAGES = ['All', 'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada'] as const

export const MusicPage = () => {
  const { data, loading } = useAsync(async () => {
    const [albums, tracks] = await Promise.all([musicService.albums(), musicService.allTracks()])
    return { albums, tracks }
  }, [])
  const { playAlbum, playTrack, current, isPlaying, toggle, isCurrent, queue } = useMusicPlayer()
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>('All')
  const [query, setQuery] = useState('')

  const albums = data?.albums ?? []
  const allTracks = data?.tracks ?? []

  const playerQueue = useMemo<PlayerTrack[]>(
    () =>
      allTracks.map((track) => ({
        ...track,
        movieId: track.albumId.replace('album-', ''),
      })),
    [allTracks],
  )

  const filteredAlbums = albums.filter((album) => {
    const matchesLanguage = language === 'All' || album.language === language
    const term = query.trim().toLowerCase()
    const matchesQuery =
      !term ||
      album.movieTitle.toLowerCase().includes(term) ||
      album.artist.toLowerCase().includes(term) ||
      album.tracks.some((track) => track.title.toLowerCase().includes(term))
    return matchesLanguage && matchesQuery
  })

  const filteredTracks = playerQueue
    .filter((track) => {
      const album = albums.find((item) => item.id === track.albumId)
      return language === 'All' || album?.language === language
    })
    .filter((track) => {
      const term = query.trim().toLowerCase()
      return !term || `${track.title} ${track.artist} ${track.movieTitle}`.toLowerCase().includes(term)
    })
    .slice(0, 14)

  const featured = albums[0]
  const featuredPlaying = current?.albumId === featured?.id && isPlaying
  const totalTracks = albums.reduce((total, album) => total + album.tracks.length, 0)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background: featured
              ? `radial-gradient(60% 120% at 85% 10%, ${featured.tone.glow}44, transparent 60%), linear-gradient(180deg, #100b12, #080808)`
              : 'linear-gradient(180deg, #101010, #080808)',
          }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] uppercase leading-none text-white/[0.025]"
          aria-hidden
        >
          Sound
        </span>

        <div className="container-page relative grid items-center gap-10 pb-12 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-16 lg:pt-16">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-accent" /> CINÉVO Sound
            </p>
            <h1 className="display-title text-[clamp(3rem,6.4vw,6rem)] text-white">
              The room after <span className="serif-accent normal-case text-accent-300">the film</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
              Songs from the sample catalog, built as a listening room rather than a playlist dump. Every track is a
              royalty-free demo recording, clearly labelled, playable end to end.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.18em] text-white/35">
              <span>{albums.length} albums</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{totalTracks} demo tracks</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Royalty-free audio</span>
            </div>

            {featured && (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => playAlbum(featured)} className="btn-primary px-6 py-3.5 text-[13px]">
                  {featuredPlaying ? <Pause size={15} className="fill-white" /> : <Play size={15} className="fill-white" />}
                  {featuredPlaying ? 'Pause the session' : 'Play the session'}
                </button>
                <Link to={`/music/album/${featured.movieId}`} className="btn-ghost px-5 py-3.5 text-[12px]">
                  <Music2 size={14} /> Open featured album
                </Link>
              </div>
            )}

            <p className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/25">
              <Sparkles size={10} className="text-accent" /> Demo audio · not an official soundtrack
            </p>
          </div>

          {featured && (
            <div className="relative mx-auto w-full max-w-[360px]">
              <div
                className="absolute -inset-8 opacity-50 blur-3xl"
                style={{ background: `radial-gradient(50% 50% at 50% 50%, ${featured.tone.glow}66, transparent 70%)` }}
                aria-hidden
              />
              <Link to={`/music/album/${featured.movieId}`} className="relative block overflow-hidden rounded-xl border border-white/15 shadow-[0_50px_120px_-35px_rgba(0,0,0,1)]">
                <AlbumArtwork album={featured} />
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                  <span>
                    <span className="block text-[8px] uppercase tracking-[0.2em] text-white/55">Featured album</span>
                    <span className="mt-1 block font-display text-lg uppercase leading-tight text-white">{featured.movieTitle}</span>
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <Play size={13} className="ml-0.5 fill-white text-white" />
                  </span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-10 sm:py-12">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-2">The record shelf</p>
            <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">Soundtracks</h2>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search songs or albums"
                aria-label="Search music"
                className="field py-2.5 pl-9 text-xs"
              />
            </div>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {LANGUAGES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] transition-colors',
                    language === item
                      ? 'border-accent bg-accent/15 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <Shimmer className="aspect-square rounded-xl" />
                <Shimmer className="mt-3 h-4 w-4/5 rounded" />
                <Shimmer className="mt-2 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filteredAlbums.length ? (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAlbums.map((album, index) => (
              <AlbumCard key={album.id} album={album} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Music2}
            title="No records on this shelf"
            description="No demo album matches this search or language. Try clearing the filters."
            actionLabel="Clear filters"
            onAction={() => {
              setLanguage('All')
              setQuery('')
            }}
            className="mt-8"
          />
        )}
      </section>

      <section className="border-t border-white/10 bg-ink-925/50 py-12 sm:py-14">
        <div className="container-page">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow mb-2 flex items-center gap-1.5">
                <ListMusic size={11} className="text-accent" /> Now spinning
              </p>
              <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">Every track</h2>
              <p className="mt-1.5 text-xs text-muted">Click any song to start it in the persistent player.</p>
            </div>
            {playerQueue.length > 0 && (
              <button
                type="button"
                onClick={() => playTrack(playerQueue[0], playerQueue)}
                className="btn-ghost px-4 py-2.5 text-[11px]"
              >
                <Play size={12} className="fill-white" /> Play all tracks
              </button>
            )}
          </div>

          {filteredTracks.length ? (
            <div className="overflow-hidden rounded-xl border border-white/10">
              {filteredTracks.map((track) => {
                const active = isCurrent(track.id)
                const playing = active && isPlaying
                return (
                  <div
                    key={`${track.albumId}-${track.id}`}
                    className={cn(
                      'group grid grid-cols-[24px_1fr_auto] items-center gap-3 border-b border-white/[0.07] px-3 py-2.5 transition-colors last:border-0 sm:grid-cols-[28px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_44px] sm:gap-4 sm:px-4',
                      active ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => (active ? toggle() : playTrack(track, playerQueue))}
                      aria-label={`${playing ? 'Pause' : 'Play'} ${track.title}`}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                        active ? 'text-accent' : 'text-white/30 group-hover:text-white',
                      )}
                    >
                      {playing ? <Pause size={11} className="fill-accent" /> : <Play size={11} className="fill-current" />}
                    </button>
                    <div className="min-w-0">
                      <p className={cn('truncate text-xs font-medium', active ? 'text-accent-300' : 'text-white/85')}>{track.title}</p>
                      <p className="truncate text-[10px] text-white/35 sm:hidden">
                        {track.movieTitle} · {track.artist}
                      </p>
                    </div>
                    <p className="hidden truncate text-[11px] text-white/45 sm:block">{track.artist}</p>
                    <Link to={`/music/album/${track.albumId.replace('album-', '')}`} className="hidden truncate text-[11px] text-white/40 hover:text-white sm:block">
                      {track.movieTitle}
                    </Link>
                    <span className="text-right font-mono text-[10px] tabular-nums text-white/35">{formatDuration(track.duration)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-center text-xs text-muted">
              No demo tracks match these filters.
            </p>
          )}

          <p className="mt-4 text-[10px] leading-relaxed text-white/25">
            Audio is provided by royalty-free SoundHelix demo files. Track titles, artists and film associations are
            fictional sample content. {queue.length > 0 && 'Your current queue lives in the player below.'}
          </p>
        </div>
      </section>
    </div>
  )
}
