import { motion } from 'framer-motion'
import { ArrowUpRight, Heart, MessageCircle, MessagesSquare, PenLine, Send, Sparkles, Star, ThumbsUp } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EmptyState } from '../components/common/EmptyState'
import { Rating } from '../components/common/Rating'
import { Shimmer } from '../components/common/Skeletons'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { communityService } from '../services/communityService'
import { movieService } from '../services/movieService'
import type { Discussion, Movie } from '../types'
import { cn } from '../utils/cn'
import { formatDate, initials, timeAgo } from '../utils/format'

type Tab = 'discussions' | 'reviews'

const TOPICS = ['Ending explained', 'Fan theory', 'Craft', 'Audience reactions', 'Most anticipated']

export const CommunityPage = () => {
  const { user } = useAuth()
  const { data, loading, reload } = useAsync(async () => {
    const [discussions, reviews, movies] = await Promise.all([
      communityService.discussions(),
      Promise.all((await movieService.list()).map((movie) => communityService.reviewsForMovie(movie.id))).then((groups) => groups.flat()),
      movieService.list(),
    ])
    const dReactions = communityService.discussionReactions()
    const rReactions = communityService.reviewReactions()
    return {
      discussions: discussions.map((item) => ({ ...item, baseLikes: item.likes - (dReactions[item.id] ? 1 : 0) })),
      reviews: reviews
        .map((item) => ({ ...item, baseLikes: item.likes - (rReactions[item.id] ? 1 : 0) }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      movies,
      dReactions,
      rReactions,
    }
  }, [])

  const [tab, setTab] = useState<Tab>('discussions')
  const [posted, setPosted] = useState<Array<Discussion & { baseLikes: number }>>([])
  const [dLiked, setDLiked] = useState<Record<string, boolean> | null>(null)
  const [rLiked, setRLiked] = useState<Record<string, boolean> | null>(null)
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [movieId, setMovieId] = useState('summer-holidays')
  const [submitting, setSubmitting] = useState(false)

  if (loading && !data) {
    return (
      <div className="container-page space-y-6 py-16">
        <Shimmer className="h-8 w-32 rounded" />
        <Shimmer className="h-20 w-3/4 rounded" />
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Shimmer key={index} className="h-36 w-full rounded-xl" />
            ))}
          </div>
          <Shimmer className="h-72 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={MessagesSquare}
          title="The room is quiet"
          description="Community content could not be loaded. Try again in a moment."
          actionLabel="Reload"
          onAction={reload}
        />
      </div>
    )
  }

  const movieMap = new Map<string, Movie>(data.movies.map((movie) => [movie.id, movie]))
  const discussions = [...posted, ...data.discussions.filter((item) => !posted.some((entry) => entry.id === item.id))]
  const effectiveDLiked = dLiked ?? data.dReactions
  const effectiveRLiked = rLiked ?? data.rReactions

  const handleDiscussionLike = async (id: string) => {
    const next = await communityService.toggleDiscussionLike(id)
    setDLiked({ ...effectiveDLiked, [id]: next })
  }

  const handleReviewLike = async (id: string) => {
    const next = await communityService.toggleReviewLike(id)
    setRLiked({ ...effectiveRLiked, [id]: next })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) {
      toast.info('Sign in to post in the sample community.')
      return
    }
    if (message.trim().length < 12) {
      toast.error('Give the room a little more than that — at least 12 characters.')
      return
    }
    setSubmitting(true)
    try {
      const discussion = await communityService.addDiscussion({
        movieId,
        author: user.name,
        message: message.trim(),
        topic,
      })
      setPosted((current) => [{ ...discussion, baseLikes: discussion.likes }, ...current])
      setMessage('')
      setTab('discussions')
      toast.success('Posted to the sample board. Stored in this browser only.')
    } finally {
      setSubmitting(false)
    }
  }

  const movieOptions = data.movies.filter((movie) => movie.status === 'now-showing' || movie.status === 'coming-soon')

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 110% at 15% 0%, rgba(229,9,20,0.14), transparent 60%), linear-gradient(180deg, #0c0a0a, #080808)' }}
          aria-hidden
        />
        <div className="container-page relative py-12 sm:py-16">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Cinema community
          </p>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h1 className="display-title text-[clamp(2.8rem,6vw,5.5rem)] text-white">
                Talk after the <span className="serif-accent normal-case text-accent-300">credits</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
                A sample room for endings, theories and the shot you cannot stop thinking about. Discussions and
                reviews below are demo content — post your own and it stays in your browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.16em] text-white/35">
              <div>
                <p className="font-display text-2xl normal-case tracking-normal text-white">{discussions.length}</p>
                <p className="mt-1">discussions</p>
              </div>
              <div>
                <p className="font-display text-2xl normal-case tracking-normal text-white">{data.reviews.length}</p>
                <p className="mt-1">sample reviews</p>
              </div>
              <div>
                <p className="font-display text-2xl normal-case tracking-normal text-white">{data.movies.length}</p>
                <p className="mt-1">films</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
          <div className="flex gap-6">
            {([
              { key: 'discussions', label: 'Discussions', count: discussions.length },
              { key: 'reviews', label: 'Reviews', count: data.reviews.length },
            ] as const).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  'relative flex items-center gap-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
                  tab === item.key ? 'text-white' : 'text-white/35 hover:text-white/70',
                )}
              >
                {item.label}
                <span className={cn('rounded-full px-1.5 py-0.5 text-[8px]', tab === item.key ? 'bg-accent/20 text-accent-200' : 'bg-white/[0.06] text-white/35')}>
                  {item.count}
                </span>
                {tab === item.key && <motion.span layoutId="community-tab" className="absolute inset-x-0 -bottom-px h-px bg-accent" />}
              </button>
            ))}
          </div>
          {tab === 'discussions' && (
            <a href="#new-discussion" className="text-[10px] uppercase tracking-[0.16em] text-white/35 transition-colors hover:text-white">
              Jump to composer ↓
            </a>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="min-w-0">
            {tab === 'discussions' ? (
              <div className="space-y-4">
                {user ? (
                  <form id="new-discussion" onSubmit={handleSubmit} className="surface p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow flex items-center gap-1.5">
                        <PenLine size={11} className="text-accent" /> Start a discussion
                      </p>
                      <span className="text-[9px] uppercase tracking-[0.14em] text-white/25">Saved locally</span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ background: `linear-gradient(145deg, ${user.avatarTone}, ${user.avatarTone}66)` }}
                      >
                        {initials(user.name)}
                      </span>
                      <p className="text-xs text-white/70">
                        Posting as <span className="text-white">{user.name}</span>
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[9px] uppercase tracking-[0.16em] text-white/35">Film</span>
                        <select value={movieId} onChange={(event) => setMovieId(event.target.value)} className="field py-2.5 text-xs">
                          {movieOptions.map((movie) => (
                            <option key={movie.id} value={movie.id}>
                              {movie.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-[9px] uppercase tracking-[0.16em] text-white/35">Topic</span>
                        <select value={topic} onChange={(event) => setTopic(event.target.value)} className="field py-2.5 text-xs">
                          {TOPICS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={3}
                      maxLength={320}
                      placeholder="What stayed with you? Spoiler tags are not supported — be kind."
                      aria-label="Discussion message"
                      className="field mt-3 resize-none py-3 text-sm"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[9px] tabular-nums text-white/25">{message.length}/320</span>
                      <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5 text-xs disabled:opacity-60">
                        <Send size={13} /> {submitting ? 'Posting…' : 'Post discussion'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="surface flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-display text-base uppercase tracking-wide text-white">Want a seat at the table?</p>
                      <p className="mt-1 text-xs text-muted">Sign in with the demo account to post a sample discussion.</p>
                    </div>
                    <Link to="/login" className="btn-primary shrink-0 px-5 py-2.5 text-xs">
                      Sign in
                    </Link>
                  </div>
                )}

                {discussions.map((discussion, index) => {
                  const movie = movieMap.get(discussion.movieId)
                  const liked = Boolean(effectiveDLiked[discussion.id])
                  const likes = discussion.baseLikes + (liked ? 1 : 0)
                  return (
                    <motion.article
                      key={discussion.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
                      className="surface p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{ background: discussion.avatarTone }}
                          >
                            {initials(discussion.author)}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-white">{discussion.author}</p>
                            <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/30">
                              {timeAgo(discussion.createdAt)} · {discussion.topic}
                            </p>
                          </div>
                        </div>
                        <span className="hidden shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-white/30 sm:block">
                          Sample post
                        </span>
                      </div>
                      <p className="mt-4 font-serif text-lg leading-snug text-white/85">{discussion.message}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => void handleDiscussionLike(discussion.id)}
                            aria-pressed={liked}
                            className={cn(
                              'flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors',
                              liked ? 'text-accent-300' : 'text-white/30 hover:text-white/60',
                            )}
                          >
                            <ThumbsUp size={11} className={liked ? 'fill-accent/20' : ''} /> {likes}
                          </button>
                          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/25">
                            <MessageCircle size={11} /> {discussion.replies} replies
                          </span>
                        </div>
                        {movie && (
                          <Link to={`/movies/${movie.id}`} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white">
                            {movie.title} <ArrowUpRight size={11} />
                          </Link>
                        )}
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[10px] leading-relaxed text-white/35">
                  <Sparkles size={12} className="shrink-0 text-accent" />
                  “Verified booking” tags are simulated in this demo. Reviews are sample content written for the
                  catalog.
                </p>
                {data.reviews.map((review) => {
                  const movie = movieMap.get(review.movieId)
                  const liked = Boolean(effectiveRLiked[review.id])
                  return (
                    <article key={review.id} className="surface p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/70">
                            {initials(review.author)}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-white">{review.author}</p>
                            <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/30">{timeAgo(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn('rounded-sm border px-1.5 py-0.5 text-[7px] uppercase tracking-[0.1em]', review.verified ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200/80' : 'border-white/15 text-white/35')}>
                            {review.verified ? 'Verified · demo' : 'Sample'}
                          </span>
                          <Rating value={review.rating} size={11} />
                        </div>
                      </div>
                      <h3 className="mt-4 font-display text-lg uppercase leading-tight tracking-wide text-white">{review.title}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-white/55">{review.body}</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                        <button
                          type="button"
                          onClick={() => void handleReviewLike(review.id)}
                          aria-pressed={liked}
                          className={cn(
                            'flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors',
                            liked ? 'text-accent-300' : 'text-white/30 hover:text-white/60',
                          )}
                        >
                          <Heart size={11} className={liked ? 'fill-accent/30' : ''} /> Helpful · {review.baseLikes + (liked ? 1 : 0)}
                        </button>
                        {movie && (
                          <Link to={`/movies/${movie.id}`} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-white">
                            {movie.title} <ArrowUpRight size={11} />
                          </Link>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="surface p-5">
              <p className="eyebrow mb-3">In the room</p>
              <ul className="space-y-3 text-[11px] leading-relaxed text-white/45">
                <li className="flex gap-2">
                  <Star size={11} className="mt-0.5 shrink-0 text-accent" /> Label spoilers in your own words. The demo
                  has no spoiler masking.
                </li>
                <li className="flex gap-2">
                  <Star size={11} className="mt-0.5 shrink-0 text-accent" /> Disagree with the take, not the person.
                </li>
                <li className="flex gap-2">
                  <Star size={11} className="mt-0.5 shrink-0 text-accent" /> Everything posted here is stored in this
                  browser only.
                </li>
              </ul>
            </div>

            <div className="surface p-5">
              <p className="eyebrow mb-3">Threads by film</p>
              <ul className="space-y-2">
                {data.movies
                  .filter((movie) => discussions.some((discussion) => discussion.movieId === movie.id))
                  .slice(0, 6)
                  .map((movie) => {
                    const count = discussions.filter((discussion) => discussion.movieId === movie.id).length
                    return (
                      <li key={movie.id}>
                        <Link
                          to={`/movies/${movie.id}`}
                          className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-2 text-[11px] text-white/55 transition-colors hover:text-white last:border-0 last:pb-0"
                        >
                          <span className="truncate">{movie.title}</span>
                          <span className="shrink-0 font-mono text-[9px] text-white/25">{count}</span>
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>

            <div className="surface p-5">
              <p className="eyebrow mb-2">Still to come</p>
              <p className="text-[11px] leading-relaxed text-white/40">
                ENE opens {formatDate('2026-11-19')} in the sample calendar. The anticipation thread is already the
                loudest room on the board.
              </p>
              <Link to="/coming-soon" className="link-underline mt-3 inline-block text-[11px] uppercase tracking-[0.14em]">
                Coming soon
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
