import {
  ArrowLeft,
  CalendarDays,
  Clapperboard,
  Clock3,
  Globe2,
  Heart,
  Music2,
  Play,
  Star,
  ThumbsUp,
  Ticket,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EmptyState } from '../components/common/EmptyState'
import { Rating } from '../components/common/Rating'
import { Shimmer } from '../components/common/Skeletons'
import { TrailerModal } from '../components/common/TrailerModal'
import { BackdropArt, PosterArt } from '../components/common/PosterArt'
import { ShowtimePicker } from '../components/booking/ShowtimePicker'
import { MovieRail } from '../components/movie/MovieRail'
import { ShareButton } from '../components/movie/ShareButton'
import { WatchlistButton } from '../components/movie/WatchlistButton'
import { TrackList } from '../components/music/TrackList'
import { communityService } from '../services/communityService'
import { movieService } from '../services/movieService'
import { musicService } from '../services/musicService'
import { useAsync } from '../hooks/useAsync'
import type { Review } from '../types'
import { cn } from '../utils/cn'
import { formatDate, formatRuntime, initials, timeAgo } from '../utils/format'

const ScoreRing = ({ value, label }: { value: number; label: string }) => (
  <div className="flex items-center gap-3">
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(#E50914 ${value}%, rgba(255,255,255,0.12) 0)` }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 font-display text-sm text-white">
        {value}
      </span>
    </div>
    <div>
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="text-[10px] text-white/60">sample score</p>
    </div>
  </div>
)

const ReviewItem = ({ review, liked, onLike }: { review: Review; liked: boolean; onLike: () => void }) => (
  <article className="border-t border-white/10 py-5 first:border-0 first:pt-0">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/70">
          {initials(review.author)}
        </span>
        <div>
          <p className="text-xs font-medium text-white">{review.author}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/30">
            {timeAgo(review.createdAt)}
            <span
              className={cn(
                'rounded-sm border px-1.5 py-0.5 text-[7px] tracking-[0.1em]',
                review.verified ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200/80' : 'border-white/15 text-white/40',
              )}
            >
              {review.verified ? 'Verified booking · demo' : 'Community sample'}
            </span>
          </p>
        </div>
      </div>
      <Rating value={review.rating} size={11} />
    </div>
    <h4 className="mt-4 font-display text-base uppercase tracking-wide text-white">{review.title}</h4>
    <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{review.body}</p>
    <button
      type="button"
      onClick={onLike}
      aria-pressed={liked}
      className={cn(
        'mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors',
        liked ? 'text-accent-300' : 'text-white/30 hover:text-white/60',
      )}
    >
      <ThumbsUp size={11} className={liked ? 'fill-accent/20' : ''} /> Helpful · {review.likes}
    </button>
  </article>
)

export const MovieDetailsPage = () => {
  const { id = '' } = useParams()
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean> | null>(null)

  const { data, loading } = useAsync(async () => {
    const [movie, related, reviews, album] = await Promise.all([
      movieService.getById(id),
      movieService.related(id),
      communityService.reviewsForMovie(id),
      musicService.albumForMovie(id),
    ])
    const reactions = communityService.reviewReactions()
    return {
      movie,
      related,
      album,
      reactions,
      reviews: reviews.map((review) => ({
        ...review,
        baseLikes: review.likes - (reactions[review.id] ? 1 : 0),
      })),
    }
  }, [id])

  const handleLike = async (reviewId: string) => {
    const next = await communityService.toggleReviewLike(reviewId)
    const current = liked ?? data?.reactions ?? {}
    setLiked({ ...current, [reviewId]: next })
    if (next) toast.success('Marked as helpful. Demo reactions stay in your browser.')
  }

  if (loading) {
    return (
      <div>
        <Shimmer className="h-[60svh] w-full" />
        <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Shimmer className="h-6 w-32 rounded" />
            <Shimmer className="h-32 w-full rounded-xl" />
          </div>
          <Shimmer className="h-72 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data?.movie) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={Clapperboard}
          title="This reel is missing"
          description="The title you asked for is not in the CINÉVO sample catalog. It may have been removed from the admin dashboard."
          actionLabel="Back to Explore"
          actionHref="/explore"
        />
      </div>
    )
  }

  const { movie, related, reviews, album } = data
  const effectiveLiked = liked ?? data.reactions
  const released = movie.status === 'now-showing' || new Date(`${movie.releaseDate}T00:00:00`).getTime() <= Date.now()

  return (
    <div>
      <section className="relative overflow-hidden">
        <BackdropArt movie={movie} />
        <div className="container-page relative pb-10 pt-10 sm:pb-14 sm:pt-14">
          <Link to="/explore" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white">
            <ArrowLeft size={12} /> Back to catalog
          </Link>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/15 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)]">
                <PosterArt movie={movie} size="lg" priority />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="date-chip border-accent/30 bg-accent/10 text-white">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
                  {released ? 'Now in cinemas' : `In cinemas ${formatDate(movie.releaseDate)}`}
                </span>
                <span className="date-chip">{movie.certificate}</span>
                <span className="date-chip">Sample film</span>
              </div>

              <h1 className="display-title mt-5 text-[clamp(2.6rem,6vw,5.6rem)] text-glow">{movie.title}</h1>
              <p className="mt-3 max-w-2xl font-serif text-base italic leading-snug text-white/65 sm:text-lg">{movie.tagline}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-white/55">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-white/35" /> {formatDate(movie.releaseDate)}
                </span>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1.5">
                  <Clock3 size={12} className="text-white/35" /> {formatRuntime(movie.runtime)}
                </span>
                <span className="h-3 w-px bg-white/20" />
                <span className="flex items-center gap-1.5">
                  <Globe2 size={12} className="text-white/35" /> {movie.languages.join(' · ')}
                </span>
                <span className="h-3 w-px bg-white/20" />
                <span>{movie.genres.join(' / ')}</span>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-fog/75">{movie.synopsis}</p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to={`/book/${movie.id}`} className="btn-primary px-6 py-3.5 text-[13px]">
                  <Ticket size={16} /> {released ? 'Book tickets' : 'Booking opens soon'}
                </Link>
                <button type="button" onClick={() => setTrailerOpen(true)} className="btn-ghost px-5 py-3.5 text-[12px]">
                  <Play size={14} className="fill-white" /> Trailer
                </button>
                <Link to={`/music/album/${movie.id}`} className="btn-ghost px-5 py-3.5 text-[12px]">
                  <Music2 size={14} /> Soundtrack
                </Link>
                <WatchlistButton movieId={movie.id} movieTitle={movie.title} variant="label" />
                <ShareButton movie={movie} className="border-white/15 px-5 py-3.5 text-xs" />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <ScoreRing value={movie.criticScore} label="Critics" />
                <ScoreRing value={movie.audienceScore} label="Audience" />
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">Anticipation</p>
                  <p className="mt-1 flex items-center gap-1.5 font-display text-lg text-white">
                    <Star size={13} className="fill-accent text-accent" />
                    {(movie.anticipation / 10).toFixed(1)}
                    <span className="text-[9px] font-sans uppercase tracking-wider text-white/30">/ 10 · demo</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/25">
            <span className="h-1 w-1 rounded-full bg-accent" />
            Demo film · cast, crew and scores are fictional sample data · remote demo artwork
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          <div>
            <p className="eyebrow mb-3">The film</p>
            <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">About {movie.title}</h2>
            <p className="mt-4 text-sm leading-[1.85] text-white/55">{movie.synopsis}</p>
            <p className="mt-4 text-sm leading-[1.85] text-white/40">
              {movie.tagline} This entry exists to demonstrate CINÉVO’s detail layout. Every person, score and plot point
              is invented for the demo.
            </p>
          </div>

          <div className="mt-10">
            <p className="eyebrow mb-4 flex items-center gap-1.5">
              <Users size={11} className="text-accent" /> Top cast
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {movie.cast.slice(0, 6).map((person, index) => (
                <div key={`${person.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: `linear-gradient(145deg, ${movie.tone.via}, ${movie.tone.to}55)` }}
                  >
                    {initials(person.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">{person.name}</p>
                    <p className="truncate text-[10px] text-white/35">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">Direction & music</p>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-4 border-b border-white/[0.07] pb-2">
                  <dt className="text-white/35">Director</dt>
                  <dd className="text-right text-white/80">{movie.director}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/[0.07] pb-2">
                  <dt className="text-white/35">Music</dt>
                  <dd className="text-right text-white/80">{movie.musicDirector}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/[0.07] pb-2">
                  <dt className="text-white/35">Cinematography</dt>
                  <dd className="text-right text-white/80">{movie.crew.find((person) => /cinemat/i.test(person.role))?.name ?? 'Demo crew'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <p className="eyebrow mb-3">Crew</p>
              <ul className="space-y-2 text-xs">
                {movie.crew.slice(0, 4).map((person) => (
                  <li key={`${person.name}-${person.role}`} className="flex justify-between gap-4 border-b border-white/[0.07] pb-2">
                    <span className="text-white/35">{person.role}</span>
                    <span className="text-right text-white/80">{person.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {album && (
            <div className="mt-12">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="eyebrow mb-2 flex items-center gap-1.5">
                    <Music2 size={11} className="text-accent" /> Original soundtrack · demo
                  </p>
                  <h2 className="font-display text-2xl uppercase tracking-wide text-white">Songs from the film</h2>
                </div>
                <Link to={`/music/album/${movie.id}`} className="link-underline text-xs">
                  Open album
                </Link>
              </div>
              <TrackList album={album} dense />
            </div>
          )}

          <div className="mt-12">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="eyebrow mb-2">Audience notes</p>
                <h2 className="font-display text-2xl uppercase tracking-wide text-white">Reviews</h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">{reviews.length} sample reviews</span>
            </div>
            {reviews.length ? (
              <div>
                {reviews.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={{ ...review, likes: review.baseLikes + (effectiveLiked[review.id] ? 1 : 0) }}
                    liked={Boolean(effectiveLiked[review.id])}
                    onLike={() => void handleLike(review.id)}
                  />
                ))}
                <p className="mt-4 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
                  Reviews are sample content. “Verified booking” tags are simulated in this frontend demo and do not
                  represent real purchases.
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-center text-xs text-muted">
                No sample reviews for this title yet.
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="surface p-5">
            <p className="eyebrow mb-4 flex items-center gap-1.5">
              <CalendarDays size={11} className="text-accent" /> Film details
            </p>
            <dl className="space-y-2.5 text-xs">
              {[
                { label: 'Release date', value: formatDate(movie.releaseDate) },
                { label: 'Runtime', value: formatRuntime(movie.runtime) },
                { label: 'Certificate', value: movie.certificate },
                { label: 'Languages', value: movie.languages.join(', ') },
                { label: 'Genres', value: movie.genres.join(', ') },
                { label: 'Director', value: movie.director },
                { label: 'Music director', value: movie.musicDirector },
                { label: 'Tracks', value: `${movie.songs.length} demo songs` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 border-b border-white/[0.07] pb-2 last:border-0 last:pb-0">
                  <dt className="shrink-0 text-white/35">{row.label}</dt>
                  <dd className="text-right text-white/75">{row.value}</dd>
                </div>
              ))}
            </dl>
            <WatchlistButton movieId={movie.id} movieTitle={movie.title} variant="label" className="mt-5 w-full justify-center px-4 py-3" />
            <p className="mt-4 flex items-start gap-2 text-[9px] leading-relaxed text-white/25">
              <Heart size={10} className="mt-0.5 shrink-0" /> Watchlist entries are saved in this browser only.
            </p>
          </div>

          <div className="surface overflow-hidden">
            <div className="px-5 pb-4 pt-5">
              <p className="eyebrow mb-2">Tickets</p>
              <p className="font-display text-lg uppercase tracking-wide text-white">
                {released ? 'Now showing in Hyderabad' : 'Booking opens on release day'}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                Sample cinemas, screens and seats. No real ticket is issued.
              </p>
            </div>
            <div className="border-t border-white/10 px-5 py-4">
              <Link to={`/book/${movie.id}`} className="btn-primary w-full px-4 py-3 text-xs">
                <Ticket size={14} /> {released ? 'Choose a show' : 'Preview booking flow'}
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast.info('Cinema data is sample-only in this frontend build.')}
            className="w-full rounded-xl border border-dashed border-white/10 px-4 py-3 text-left text-[10px] leading-relaxed text-white/30 transition-colors hover:border-white/20 hover:text-white/50"
          >
            Why sample data? CINÉVO does not invent official cinema listings or ticket availability. Tap to read more.
          </button>
        </aside>
      </section>

      <section id="showtimes" className="border-t border-white/10 py-12">
        <div className="container-page">
          <ShowtimePicker movie={movie} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/10 py-14">
          <div className="container-page">
            <MovieRail
              eyebrow="If this one stays with you"
              title="More like this"
              description="Related by genre, language and sample popularity."
              movies={related}
              href="/explore"
            />
          </div>
        </section>
      )}

      <div className="container-page pb-16">
        <p className="border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/25">
          CINÉVO demo page · all metadata, scores, people and soundtrack links are sample data. Generated typographic
          remote demo artwork, not official key art.
        </p>
      </div>

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={movie.title} trailerUrl={movie.trailerUrl} />
    </div>
  )
}
