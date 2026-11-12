import { motion } from 'framer-motion'
import { BarChart3, Check, Swords } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { communityService } from '../../services/communityService'
import type { FaceOff, Movie, VoteRecord } from '../../types'
import { cn } from '../../utils/cn'
import { formatDate, formatNumber } from '../../utils/format'
import { PosterArt } from '../common/PosterArt'

interface FaceOffCardProps {
  faceOff: FaceOff
  movieA: Movie
  movieB: Movie
  compact?: boolean
  className?: string
}

const interest = (movie: Movie) => ({
  trailer: Math.min(97, Math.round(42 + movie.popularity * 0.32 + movie.anticipation * 0.2)),
  music: Math.min(96, Math.round(28 + movie.songs.length * 9 + movie.popularity * 0.3)),
})

const MetricRow = ({ label, a, b }: { label: string; a: number; b: number }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.16em]">
      <span className="text-white/70">{a}%</span>
      <span className="text-muted">{label}</span>
      <span className="text-white/70">{b}%</span>
    </div>
    <div className="flex h-1 overflow-hidden rounded-full bg-white/10">
      <motion.span
        className="h-full bg-white/70"
        initial={{ width: '50%' }}
        animate={{ width: `${a}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="h-full flex-1 bg-accent/80" />
    </div>
  </div>
)

export const FaceOffCard = ({ faceOff, movieA, movieB, compact = false, className }: FaceOffCardProps) => {
  const [vote, setVote] = useState<VoteRecord | undefined>(() => communityService.getVote(faceOff.id))
  const tally = communityService.tally(faceOff, vote)
  const votedA = vote?.movieId === movieA.id
  const votedB = vote?.movieId === movieB.id
  const metricsA = interest(movieA)
  const metricsB = interest(movieB)

  const handleVote = (movie: Movie) => {
    const record = communityService.castVote(faceOff.id, movie.id)
    setVote(record)
    toast.success(`Vote counted for ${movie.title} · sample poll, saved locally.`)
  }

  return (
    <div className={cn('surface overflow-hidden', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5">
            <Swords size={11} className="text-accent" /> Movie Face-Off
          </p>
          <h3 className="font-display text-base uppercase tracking-wide text-white sm:text-lg">{faceOff.title}</h3>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-muted">
          <span className="h-1 w-1 rounded-full bg-accent" />
          Sample poll
        </span>
      </div>

      <div className={cn('grid grid-cols-2 gap-3 p-4 sm:gap-5 sm:p-6', compact ? '' : 'md:gap-8')}>
        {[movieA, movieB].map((movie, index) => {
          const selected = index === 0 ? votedA : votedB
          const percent = index === 0 ? tally.percentA : tally.percentB
          return (
            <div key={movie.id} className="min-w-0">
              <div className="relative overflow-hidden rounded-lg border border-white/10">
                <div className={cn(compact ? 'aspect-[4/5]' : 'aspect-[2/3]')}>
                  <PosterArt movie={movie} size={compact ? 'sm' : 'md'} />
                </div>
                <span className="absolute left-2 top-2 rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/70 backdrop-blur">
                  {index === 0 ? 'A' : 'B'}
                </span>
                {selected && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                    <Check size={8} /> Your pick
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm uppercase tracking-wide text-white">{movie.title}</p>
                  <p className="truncate text-[10px] text-muted">
                    {movie.genres[0]} · {movie.languages[0]}
                  </p>
                </div>
                <span className="shrink-0 font-display text-xl text-white">{percent.toFixed(1)}%</span>
              </div>
              <button
                type="button"
                onClick={() => handleVote(movie)}
                aria-pressed={selected}
                className={cn(
                  'mt-2.5 w-full rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
                  selected
                    ? 'border border-accent/50 bg-accent/15 text-white'
                    : 'border border-white/15 bg-white/[0.03] text-white/80 hover:border-white/40 hover:bg-white/[0.08]',
                )}
              >
                {selected ? 'Voted' : `Vote ${movie.title}`}
              </button>
            </div>
          )
        })}
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-muted">
          <span>{formatNumber(Math.round(tally.votesA))} votes</span>
          <span>{formatNumber(tally.votesA + tally.votesB)} total</span>
          <span>{formatNumber(Math.round(tally.votesB))} votes</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-white/70 to-white/90"
            initial={{ width: '50%' }}
            animate={{ width: `${tally.percentA}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="h-full bg-gradient-to-r from-accent-600 to-accent"
            initial={{ width: '50%' }}
            animate={{ width: `${tally.percentB}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {!compact && (
          <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
            <MetricRow label="Trailer interest" a={metricsA.trailer} b={metricsB.trailer} />
            <MetricRow label="Soundtrack interest" a={metricsA.music} b={metricsB.music} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.14em] text-white/30">
          <span className="flex items-center gap-1.5">
            <BarChart3 size={10} /> {faceOff.note}
          </span>
          <span>Closes {formatDate(faceOff.closesOn)}</span>
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-white/25">
          Trailer and soundtrack interest are illustrative sample metrics, not audience measurements. Votes are stored in
          your browser only.
        </p>
      </div>
    </div>
  )
}
