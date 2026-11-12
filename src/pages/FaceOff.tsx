import { ArrowUpRight, Info, Swords, Timer, Vote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Shimmer } from '../components/common/Skeletons'
import { FaceOffCard } from '../components/movie/FaceOffCard'
import { useAsync } from '../hooks/useAsync'
import { communityService } from '../services/communityService'
import { movieService } from '../services/movieService'
import type { Movie } from '../types'
import { formatDate } from '../utils/format'

export const FaceOffPage = () => {
  const { data, loading } = useAsync(async () => {
    const movies = await movieService.list()
    return {
      movies,
      faceOffs: communityService.getFaceOffs(),
    }
  }, [])

  if (loading || !data) {
    return (
      <div className="container-page space-y-6 py-16">
        <Shimmer className="h-10 w-2/3 rounded" />
        <Shimmer className="h-4 w-1/2 rounded" />
        <Shimmer className="mt-8 h-[420px] w-full rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Shimmer className="h-[440px] rounded-2xl" />
          <Shimmer className="h-[440px] rounded-2xl" />
        </div>
      </div>
    )
  }

  const movieMap = new Map<string, Movie>(data.movies.map((movie) => [movie.id, movie]))
  const resolved = data.faceOffs
    .map((faceOff) => ({
      faceOff,
      movieA: movieMap.get(faceOff.movieAId),
      movieB: movieMap.get(faceOff.movieBId),
    }))
    .filter((entry): entry is { faceOff: (typeof data.faceOffs)[number]; movieA: Movie; movieB: Movie } =>
      Boolean(entry.movieA && entry.movieB),
    )

  const [featured, ...rest] = resolved

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(70% 120% at 50% 0%, rgba(229,9,20,0.18), transparent 60%), linear-gradient(180deg, #0e0a0b, #080808)' }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center font-display text-[19vw] uppercase leading-[0.75] text-white/[0.025]"
          aria-hidden
        >
          Face Off
        </span>
        <div className="container-page relative py-14 text-center sm:py-20">
          <p className="eyebrow mb-4 flex items-center justify-center gap-2">
            <Swords size={12} className="text-accent" /> The CINÉVO Face-Off
          </p>
          <h1 className="display-title mx-auto max-w-4xl text-[clamp(3rem,7vw,6.5rem)] text-white">
            Two films enter. <span className="serif-accent normal-case text-accent-300">You decide.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted">
            Head-to-head sample polls across the catalog. Pick a side, watch the bars move in real time, then argue
            about it in the community. Every vote is local and clearly a demo.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#live-polls" className="btn-primary px-6 py-3 text-xs">
              <Vote size={14} /> Cast a vote
            </a>
            <Link to="/community" className="btn-ghost px-5 py-3 text-xs">
              Discuss the results <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      <section id="live-polls" className="container-page py-12 sm:py-16">
        {featured ? (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow mb-2 flex items-center gap-1.5">
                  <Timer size={11} className="text-accent" /> Closing soon
                </p>
                <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">The main event</h2>
              </div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Closes {formatDate(featured.faceOff.closesOn)}
              </p>
            </div>
            <FaceOffCard faceOff={featured.faceOff} movieA={featured.movieA} movieB={featured.movieB} />
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-muted">
            No face-offs are running in the demo right now.
          </p>
        )}

        {rest.length > 0 && (
          <div className="mt-14">
            <div className="mb-6">
              <p className="eyebrow mb-2">Still on the card</p>
              <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">More matchups</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {rest.map((entry) => (
                <FaceOffCard
                  key={entry.faceOff.id}
                  faceOff={entry.faceOff}
                  movieA={entry.movieA}
                  movieB={entry.movieB}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-3 sm:p-8">
          {[
            {
              title: 'Pick a side',
              copy: 'Vote for the film you would book first. One vote per matchup; change it any time.',
            },
            {
              title: 'Watch it move',
              copy: 'The split bar updates instantly from the sample vote base plus your saved pick.',
            },
            {
              title: 'Keep it local',
              copy: 'No server, no account needed. Votes live in this browser and reset with demo data.',
            },
          ].map((item, index) => (
            <div key={item.title} className="border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 first:border-0 first:pl-0 first:pt-0">
              <p className="font-display text-3xl text-white/15">{String(index + 1).padStart(2, '0')}</p>
              <p className="mt-2 font-display text-sm uppercase tracking-wide text-white">{item.title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">{item.copy}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 flex items-start gap-2 text-[10px] leading-relaxed text-white/25">
          <Info size={12} className="mt-0.5 shrink-0 text-accent/70" />
          Base vote counts, percentages, trailer interest and soundtrack interest are invented sample metrics. CINÉVO
          does not present them as real audience polling.
        </p>
      </section>
    </div>
  )
}
