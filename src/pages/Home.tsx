import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  MessagesSquare,
  Music2,
  Play,
  Quote,
  Ticket,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMusicPlayer } from '../context/MusicPlayerContext'
import { useAsync } from '../hooks/useAsync'
import { communityService } from '../services/communityService'
import { movieService } from '../services/movieService'
import { musicService } from '../services/musicService'
import { theatreService } from '../services/theatreService'
import type { Movie } from '../types'
import { timeAgo } from '../utils/format'
import { AlbumArtwork } from '../components/music/AlbumArtwork'
import { AlbumCard } from '../components/music/AlbumCard'
import { TrackList } from '../components/music/TrackList'
import { Countdown } from '../components/common/Countdown'
import { SectionHeading } from '../components/common/SectionHeading'
import { Shimmer } from '../components/common/Skeletons'
import { TrendingTicker } from '../components/common/TrendingTicker'
import { FaceOffCard } from '../components/movie/FaceOffCard'
import { HeroCarousel } from '../components/movie/HeroCarousel'
import { MovieRail } from '../components/movie/MovieRail'
import { UpcomingSpotlight } from '../components/movie/UpcomingSpotlight'

const SPOTLIGHT_IDS = ['summer-holidays', 'scene', 'ene']

export const HomePage = () => {
  const { user } = useAuth()
  const { playAlbum } = useMusicPlayer()
  const genres = user?.favouriteGenres.join('|') ?? ''

  const { data, loading } = useAsync(async () => {
    const [featured, trending, anticipated, latest, upcoming, telugu, topRated, albums, discussions, theatres, allMovies] =
      await Promise.all([
        movieService.featured(),
        movieService.trending(),
        movieService.mostAnticipated(),
        movieService.latest(),
        movieService.upcoming(),
        movieService.teluguPopular(),
        movieService.topRated(),
        musicService.albums(),
        communityService.discussions(),
        theatreService.list('Hyderabad'),
        movieService.list(),
      ])
    const favouriteGenres = user?.favouriteGenres.length ? user.favouriteGenres : ['Drama', 'Thriller', 'Romance']
    const recommended = await movieService.recommended(favouriteGenres)
    const spotlights = SPOTLIGHT_IDS.map((id) => allMovies.find((movie) => movie.id === id)).filter(
      (movie): movie is Movie => Boolean(movie),
    )
    const faceOff = communityService.getFaceOffs()[0]
    const faceOffMovies = faceOff
      ? [faceOff.movieAId, faceOff.movieBId]
          .map((id) => allMovies.find((movie) => movie.id === id))
          .filter((movie): movie is Movie => Boolean(movie))
      : []
    const movieMap = new Map(allMovies.map((movie) => [movie.id, movie]))
    return {
      featured,
      trending,
      anticipated,
      latest,
      upcoming,
      telugu,
      topRated,
      albums,
      discussions,
      theatres,
      recommended,
      spotlights,
      faceOff,
      faceOffMovies,
      movieMap,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genres])

  if (loading && !data) {
    return (
      <div className="container-page space-y-8 py-20">
        <Shimmer className="h-[52svh] w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Shimmer key={index} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const featured = data.featured.length ? data.featured : data.trending
  const [summer, scene, ene] = data.spotlights
  const featuredAlbum = data.albums[0]
  const featuredDiscussion = data.discussions[0]
  const discussionMovie = featuredDiscussion ? data.movieMap.get(featuredDiscussion.movieId) : undefined

  return (
    <div className="pb-8">
      <HeroCarousel movies={featured.slice(0, 4)} />
      <TrendingTicker movies={data.trending.slice(0, 8)} />

      {/* November slate */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Mark the calendar"
          title={
            <>
              November, <span className="serif-accent normal-case text-accent-300">double feature</span>
            </>
          }
          description="Two Fridays. Three films. One sample calendar built for the CINÉVO demo — release dates are illustrative."
          actionLabel="See the full slate"
          actionHref="/coming-soon"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {summer && <UpcomingSpotlight movie={summer} index={0} />}
          {scene && <UpcomingSpotlight movie={scene} index={1} />}
        </div>

        {ene && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <UpcomingSpotlight movie={ene} layout="wide" index={2} />
            <div className="surface relative flex flex-col justify-between overflow-hidden p-6 sm:p-7">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{ background: `radial-gradient(80% 80% at 80% 10%, ${ene.tone.glow}55, transparent 65%)` }}
                aria-hidden
              />
              <div className="relative">
                <p className="eyebrow mb-3 flex items-center gap-1.5">
                  <CalendarDays size={11} className="text-accent" /> The date
                </p>
                <p className="font-display text-6xl leading-none text-white sm:text-7xl">19</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-white/50">November 2026 · Friday</p>
                <p className="mt-5 max-w-xs text-xs leading-relaxed text-white/45">
                  {ene.tagline} The countdown below is real; the release date is part of the demo calendar.
                </p>
              </div>
              <div className="relative mt-8">
                <Countdown target={`${ene.releaseDate}T09:00:00`} label="Releases in" variant="inline" />
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/movies/${ene.id}`} className="btn-ghost px-4 py-2.5 text-[11px]">
                    Details <ArrowUpRight size={12} />
                  </Link>
                  <Link to={`/music/album/${ene.id}`} className="btn-ghost px-4 py-2.5 text-[11px]">
                    <Music2 size={12} /> Soundtrack
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trending + anticipated */}
      <div className="container-page space-y-14 py-4 sm:space-y-20">
        <MovieRail
          eyebrow="What Hyderabad is watching"
          title="Trending now"
          description="Sample popularity scores across the demo catalog."
          movies={data.trending.slice(0, 10)}
          href="/explore"
          showStatus
        />
        <MovieRail
          eyebrow="The waiting list"
          title="Most anticipated"
          description="Upcoming titles ranked by demo anticipation scores."
          movies={data.anticipated.slice(0, 10)}
          href="/coming-soon"
          actionLabel="All upcoming"
        />
      </div>

      {/* Music editorial */}
      {featuredAlbum && (
        <section className="relative mt-16 overflow-hidden border-y border-white/10 bg-ink-925 py-16 sm:mt-20 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: `radial-gradient(60% 70% at 20% 20%, ${featuredAlbum.tone.glow}33, transparent 65%)` }}
            aria-hidden
          />
          <div className="container-page relative">
            <SectionHeading
              eyebrow="CINÉVO Sound"
              title={
                <>
                  The songs stay <span className="serif-accent normal-case text-accent-300">after</span> the credits
                </>
              }
              description="Royalty-free demo recordings paired with each film. Every track is labelled and playable in the persistent player."
              actionLabel="Open the music room"
              actionHref="/music"
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-12">
              <div>
                <div className="relative mx-auto max-w-[340px] overflow-hidden rounded-xl border border-white/15 shadow-[0_40px_100px_-40px_rgba(0,0,0,1)] lg:mx-0">
                  <AlbumArtwork album={featuredAlbum} />
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl uppercase tracking-wide text-white">{featuredAlbum.movieTitle}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {featuredAlbum.artist} · {featuredAlbum.year} · {featuredAlbum.language}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playAlbum(featuredAlbum)}
                    aria-label={`Play ${featuredAlbum.movieTitle} soundtrack`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink-950 transition-transform hover:scale-105 active:scale-95"
                  >
                    <Play size={16} className="ml-0.5 fill-ink-950" />
                  </button>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-white/30">
                  Demo audio · royalty-free SoundHelix recordings. Not the official soundtrack of any real film.
                </p>
              </div>

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="eyebrow flex items-center gap-1.5">
                    <Music2 size={11} className="text-accent" /> Featured album
                  </span>
                  <Link to={`/music/album/${featuredAlbum.movieId}`} className="link-underline text-xs">
                    Full album <ArrowUpRight size={12} />
                  </Link>
                </div>
                <TrackList album={featuredAlbum} showHeader={false} />

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {data.albums.slice(1, 4).map((album, index) => (
                    <AlbumCard key={album.id} album={album} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest + upcoming */}
      <div className="container-page space-y-14 py-16 sm:space-y-20 sm:py-20">
        <MovieRail
          eyebrow="Fresh in the catalog"
          title="Latest releases"
          description="Newest sample additions, sorted by release date."
          movies={data.latest.slice(0, 10)}
          href="/explore?sort=release"
          actionLabel="Browse latest"
        />
        <MovieRail
          eyebrow="On the horizon"
          title="Upcoming films"
          description="Everything with a future demo release date."
          movies={data.upcoming.slice(0, 10)}
          href="/coming-soon"
          actionLabel="All coming soon"
        />
      </div>

      {/* Face-off + community */}
      <section className="border-y border-white/10 bg-ink-925/60 py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            {data.faceOff && data.faceOffMovies.length === 2 ? (
              <FaceOffCard faceOff={data.faceOff} movieA={data.faceOffMovies[0]} movieB={data.faceOffMovies[1]} />
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] leading-relaxed text-white/30">
                Every face-off is a sample poll. Votes live in your browser.
              </p>
              <Link to="/face-off" className="link-underline text-xs">
                All face-offs <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <SectionHeading
                eyebrow="Cinema community"
                title={
                  <>
                    Talk after the <span className="serif-accent normal-case text-accent-300">credits</span>
                  </>
                }
                description="Sample discussions and reviews from the CINÉVO community — clearly demo content."
              />
              {featuredDiscussion && (
                <Link to="/community" className="group block border-l border-accent/50 pl-5">
                  <Quote size={20} className="mb-3 text-accent/70" />
                  <p className="font-serif text-xl italic leading-snug text-white/85 transition-colors group-hover:text-white sm:text-2xl">
                    “{featuredDiscussion.message}”
                  </p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {featuredDiscussion.author} · {discussionMovie?.title ?? 'Community'} · {timeAgo(featuredDiscussion.createdAt)}
                  </p>
                </Link>
              )}

              <div className="mt-7 space-y-3">
                {data.discussions.slice(1, 4).map((discussion) => {
                  const movie = data.movieMap.get(discussion.movieId)
                  return (
                    <Link
                      key={discussion.id}
                      to="/community"
                      className="group flex items-start justify-between gap-4 border-t border-white/10 pt-3"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs leading-relaxed text-white/65 group-hover:text-white/90">
                          {discussion.message}
                        </p>
                        <p className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-white/30">
                          {discussion.topic} · {movie?.title ?? 'Film'} · {discussion.replies} replies
                        </p>
                      </div>
                      <ArrowUpRight size={13} className="mt-0.5 shrink-0 text-white/20 group-hover:text-white/70" />
                    </Link>
                  )
                })}
              </div>
            </div>

            <Link to="/community" className="btn-ghost mt-8 w-fit px-5 py-3 text-xs">
              <MessagesSquare size={14} /> Enter the community
            </Link>
          </div>
        </div>
      </section>

      {/* Telugu + recommended + top rated */}
      <div className="container-page space-y-14 py-16 sm:space-y-20 sm:py-20">
        <MovieRail
          eyebrow="Tollywood, curated"
          title="Popular Telugu cinema"
          description="Telugu-language titles from the sample catalog."
          movies={data.telugu.slice(0, 10)}
          href="/explore?language=Telugu"
          actionLabel="More Telugu"
        />
        <MovieRail
          eyebrow="Picked for you"
          title={user ? `Because you like ${user.favouriteGenres.slice(0, 2).join(' & ') || 'cinema'}` : 'Recommended for you'}
          description={user ? 'Based on the genres saved in your demo profile.' : 'Sign in to tune recommendations to your taste.'}
          movies={data.recommended.slice(0, 10)}
          href="/explore"
        />
        <MovieRail
          eyebrow="The critics’ shelf"
          title="Top rated"
          description="Highest sample critic scores in the CINÉVO catalog."
          movies={data.topRated.slice(0, 10)}
          href="/explore?sort=rating"
          actionLabel="See the ranking"
        />
      </div>

      {/* Cinema near you */}
      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Cinema near you"
            title={
              <>
                Rooms worth <span className="serif-accent normal-case text-accent-300">leaving home</span> for
              </>
            }
            description="Sample Hyderabad venues with demo screens, amenities and seat layouts."
            actionLabel="All cinemas"
            actionHref="/cinemas"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.theatres.slice(0, 3).map((theatre, index) => (
              <motion.article
                key={theatre.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="group surface overflow-hidden"
              >
                <div className="relative h-32 overflow-hidden border-b border-white/10 bg-ink-850">
                  <div
                    className="absolute inset-0 opacity-60 transition-transform duration-700 group-hover:scale-105"
                    style={{
                      background: `radial-gradient(120% 120% at 80% 0%, ${index % 2 ? '#0f4c5c' : '#7a2d16'}88, transparent 60%), linear-gradient(130deg, #151515, #080808)`,
                    }}
                    aria-hidden
                  />
                  <span className="absolute inset-x-0 bottom-0 select-none whitespace-nowrap px-4 pb-1 font-display text-[74px] uppercase leading-none text-white/[0.06]">
                    {theatre.area.split(' ')[0]}
                  </span>
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-white/70 backdrop-blur">
                    <Building2 size={10} /> Sample venue
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <p className="font-display text-2xl uppercase tracking-wide text-white">{theatre.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/50">
                      {theatre.area} · {theatre.city}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.amenities.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-white/45">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-white/35">
                      {theatre.screens.length} screens · {theatre.screens[0].format}
                    </span>
                    <Link to="/cinemas" className="link-underline text-xs">
                      View <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
              <Ticket size={12} className="text-accent" /> Booking is open for now-showing films in Hyderabad
            </p>
            <Link to="/explore?status=now-showing" className="btn-primary px-5 py-2.5 text-xs">
              Find a show
            </Link>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div
            className="absolute inset-0 opacity-70"
            style={{ background: 'radial-gradient(60% 100% at 50% 120%, rgba(229,9,20,0.28), transparent 70%), linear-gradient(180deg, #151515, #080808)' }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow mb-4">A note from the projection booth</p>
            <h2 className="display-title text-[clamp(2.2rem,4.4vw,4rem)] text-white">
              Posters fade. <span className="serif-accent normal-case text-accent-300">The feeling stays.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/50">
              CINÉVO is a frontend-only film journal. Browse a sample catalog, listen to demo soundtracks, vote in
              face-offs and walk through a full ticket-booking flow — no real payments, no real cinemas.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/explore" className="btn-primary px-6 py-3 text-xs">
                Explore the catalog
              </Link>
              <Link to="/login" className="btn-ghost px-6 py-3 text-xs">
                Try the demo account
              </Link>
            </div>
            <p className="mt-6 text-[9px] uppercase tracking-[0.18em] text-white/25">
              Sample content · remote demo artwork · demo audio
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
