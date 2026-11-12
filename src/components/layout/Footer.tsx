import { ArrowRight, AtSign, Camera, Video } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useMusicPlayer } from '../../context/MusicPlayerContext'
import { cn } from '../../utils/cn'

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Explore Movies', to: '/explore' },
      { label: 'Coming Soon', to: '/coming-soon' },
      { label: 'Music', to: '/music' },
      { label: 'Movie Face-Off', to: '/face-off' },
      { label: 'Community', to: '/community' },
    ],
  },
  {
    title: 'Your CINÉVO',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'My Bookings', to: '/bookings' },
      { label: 'Watchlist', to: '/watchlist' },
      { label: 'Profile', to: '/profile' },
    ],
  },
  {
    title: 'Near you',
    links: [
      { label: 'Cinemas', to: '/cinemas' },
      { label: 'Search', to: '/search' },
      { label: 'Admin demo', to: '/admin' },
    ],
  },
]

export const Footer = () => {
  const [email, setEmail] = useState('')
  const { current } = useMusicPlayer()

  const subscribe = (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) {
      toast.error('Enter a valid email address to join the demo list.')
      return
    }
    toast.success('Added to the demo list. CINÉVO does not send real emails.')
    setEmail('')
  }

  return (
    <footer className={cn('relative overflow-hidden border-t border-white/10 bg-ink-925', current && 'pb-[72px] sm:pb-[84px]')}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container-page relative py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-baseline gap-1.5" aria-label="CINÉVO home">
              <span className="font-display text-2xl uppercase leading-none tracking-[0.24em] text-white">Cinévo</span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/40">
              A cinematic discovery journal — films, soundtracks and the rooms we watch them in. Built as a frontend-only
              experience for the love of the big screen.
            </p>

            <form onSubmit={subscribe} className="mt-6 max-w-xs">
              <label htmlFor="footer-email" className="mb-2 block text-[9px] uppercase tracking-[0.2em] text-white/35">
                Demo newsletter
              </label>
              <div className="flex items-center gap-2 border-b border-white/15 pb-2 focus-within:border-accent">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-xs text-white placeholder:text-white/20"
                />
                <button type="submit" aria-label="Join demo newsletter" className="shrink-0 text-white/50 transition-colors hover:text-accent">
                  <ArrowRight size={15} />
                </button>
              </div>
              <p className="mt-2 text-[9px] text-white/25">No real emails. Nothing is sent anywhere.</p>
            </form>

            <div className="mt-6 flex gap-2">
              {[
                { icon: Camera, label: 'Instagram' },
                { icon: AtSign, label: 'Twitter' },
                { icon: Video, label: 'YouTube' },
              ].map((social) => (
                <button
                  key={social.label}
                  type="button"
                  aria-label={`${social.label} (demo link)`}
                  onClick={() => toast.info(`${social.label} is a placeholder in this demo.`)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-white/30 hover:text-white"
                >
                  <social.icon size={13} />
                </button>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-xs text-white/55 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="max-w-3xl text-[10px] leading-relaxed text-white/30">
            CINÉVO is a frontend demonstration. All films and songs are original sample entries; cast, crew, reviews,
            cinema names, addresses, showtimes, seat availability and votes are demo data. Poster and backdrop artwork is
            remote demo images — not official key art. Music uses royalty-free demo recordings. No real accounts,
            payments, tickets or emails are created.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">© 2026 CINÉVO. All sample rights reserved.</p>
            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-white/25">
              <span className="h-1 w-1 animate-pulse-dot rounded-full bg-accent" />
              Frontend-only build · React + Vite
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
