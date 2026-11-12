import { ArrowLeft, Bookmark, BookmarkCheck, Clapperboard, Disc3, Info, Pause, Play, Ticket } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EmptyState } from '../components/common/EmptyState'
import { Shimmer } from '../components/common/Skeletons'
import { AlbumCard } from '../components/music/AlbumCard'
import { AlbumArtwork } from '../components/music/AlbumArtwork'
import { TrackList } from '../components/music/TrackList'
import { useMusicPlayer } from '../context/MusicPlayerContext'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import { musicService } from '../services/musicService'
import { userService } from '../services/userService'
import { formatDuration, formatRuntime } from '../utils/format'

export const MusicAlbumPage = () => {
  const { movieId = '' } = useParams()
  const { playAlbum, current, isPlaying, toggle } = useMusicPlayer()
  const [saved, setSaved] = useState<string[]>(() => userService.getSavedAlbums())

  const { data, loading } = useAsync(async () => {
    const [album, movie, albums] = await Promise.all([
      musicService.albumForMovie(movieId),
      movieService.getById(movieId),
      musicService.albums(),
    ])
    return { album, movie, albums }
  }, [movieId])

  if (loading) {
    return (
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[340px_1fr]">
        <Shimmer className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Shimmer className="h-4 w-24 rounded" />
          <Shimmer className="h-16 w-3/4 rounded" />
          <Shimmer className="h-10 w-40 rounded" />
          <Shimmer className="mt-8 h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data?.album || !data.movie) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Disc3}
          title="No soundtrack here"
          description="This film has no demo album in the catalog, or the title no longer exists."
          actionLabel="Browse music"
          actionHref="/music"
        />
      </div>
    )
  }

  const { album, movie, albums } = data
  const isSaved = saved.includes(album.id)
  const playingAlbum = current?.albumId === album.id && isPlaying
  const moreAlbums = albums.filter((item) => item.id !== album.id).slice(0, 5)

  const toggleSaved = () => {
    const next = isSaved ? saved.filter((id) => id !== album.id) : [...saved, album.id]
    setSaved(userService.saveAlbums(next))
    toast.success(isSaved ? 'Album removed from your saved list.' : 'Album saved to your profile playlists.')
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(70% 110% at 15% 0%, ${album.tone.glow}40, transparent 60%), linear-gradient(180deg, #0d0a0e, #080808)`,
          }}
          aria-hidden
        />
        <div className="container-page relative py-10 sm:py-14">
          <Link to="/music" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white">
            <ArrowLeft size={12} /> All soundtracks
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-end xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="relative mx-auto w-full max-w-[340px]">
              <div
                className="absolute -inset-6 opacity-60 blur-3xl"
                style={{ background: `radial-gradient(50% 50% at 50% 50%, ${album.tone.glow}55, transparent 70%)` }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-xl border border-white/15 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)]">
                <AlbumArtwork album={album} />
              </div>
            </div>

            <div className="min-w-0">
              <p className="eyebrow mb-3 flex items-center gap-2">
                <span className="h-px w-8 bg-accent" /> CINÉVO Sound · Album
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{album.title}</p>
              <h1 className="display-title mt-2 text-[clamp(2.4rem,5.6vw,5rem)] text-white">{album.movieTitle}</h1>
              <p className="mt-3 font-serif text-base italic text-white/55">
                Score & songs by {album.artist} · {album.year} · {album.language}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
                <span>{album.tracks.length} tracks</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{formatRuntime(Math.round(album.runtime / 60))} total</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="rounded-sm border border-white/15 px-1.5 py-0.5 text-[8px]">Demo audio</span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => (current?.albumId === album.id ? toggle() : playAlbum(album))}
                  className="btn-primary px-6 py-3.5 text-[13px]"
                >
                  {playingAlbum ? <Pause size={15} className="fill-white" /> : <Play size={15} className="fill-white" />}
                  {playingAlbum ? 'Pause album' : 'Play album'}
                </button>
                <button type="button" onClick={toggleSaved} className="btn-ghost px-5 py-3.5 text-[12px]">
                  {isSaved ? <BookmarkCheck size={14} className="text-accent" /> : <Bookmark size={14} />}
                  {isSaved ? 'Saved' : 'Save album'}
                </button>
                <Link to={`/movies/${movie.id}`} className="btn-ghost px-5 py-3.5 text-[12px]">
                  <Clapperboard size={14} /> The film
                </Link>
                <Link to={`/book/${movie.id}`} className="btn-ghost px-5 py-3.5 text-[12px]">
                  <Ticket size={14} /> Book tickets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 lg:py-12">
        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow mb-2">Tracklist</p>
              <h2 className="font-display text-2xl uppercase tracking-wide text-white">The sessions</h2>
            </div>
            <span className="text-[9px] uppercase tracking-[0.16em] text-white/25">Click a song to play</span>
          </div>
          <TrackList album={album} />
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[10px] leading-relaxed text-white/30">
            <Info size={13} className="mt-0.5 shrink-0 text-accent/80" />
            Every track streams a royalty-free SoundHelix demo file. Song names, lyricists and singer credits are
            fictional sample metadata; this is not an official soundtrack release.
          </p>
        </div>

        <aside className="space-y-5">
          <div className="surface p-5">
            <p className="eyebrow mb-4">Album credits</p>
            <dl className="space-y-2.5 text-xs">
              {[
                { label: 'Film', value: album.movieTitle },
                { label: 'Composer', value: album.artist },
                { label: 'Year', value: album.year },
                { label: 'Language', value: album.language },
                { label: 'Tracks', value: String(album.tracks.length) },
                { label: 'Runtime', value: formatDuration(album.runtime) },
                { label: 'Audio', value: 'Royalty-free demo' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 border-b border-white/[0.07] pb-2 last:border-0 last:pb-0">
                  <dt className="text-white/35">{row.label}</dt>
                  <dd className="text-right text-white/80">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface p-5">
            <p className="eyebrow mb-2">About the film</p>
            <p className="text-xs leading-relaxed text-white/45">{movie.synopsis}</p>
            <Link to={`/movies/${movie.id}`} className="link-underline mt-4 inline-block text-[11px] uppercase tracking-[0.14em]">
              Film details
            </Link>
          </div>
        </aside>
      </section>

      {moreAlbums.length > 0 && (
        <section className="border-t border-white/10 py-12">
          <div className="container-page">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow mb-2">Keep listening</p>
                <h2 className="font-display text-2xl uppercase tracking-wide text-white">More from the shelf</h2>
              </div>
              <Link to="/music" className="link-underline text-xs">
                All albums
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {moreAlbums.map((item, index) => (
                <AlbumCard key={item.id} album={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container-page pb-16">
        <p className="border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
          Saved albums live in this browser and appear on your profile. Demo audio only — CINÉVO makes no claim to
          official soundtrack rights.
        </p>
      </div>
    </div>
  )
}
