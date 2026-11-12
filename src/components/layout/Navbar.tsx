import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Ticket,
  User,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation as useRouterLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useLocation as useCity } from '../../context/LocationContext'
import { cn } from '../../utils/cn'
import { initials } from '../../utils/format'
import { SearchOverlay } from './SearchOverlay'

const NAV_ITEMS = [
  { label: 'Explore Movies', to: '/explore' },
  { label: 'Coming Soon', to: '/coming-soon' },
  { label: 'Music', to: '/music' },
  { label: 'Face-Off', to: '/face-off' },
  { label: 'My Bookings', to: '/bookings' },
]

const Logo = () => (
  <Link to="/" aria-label="CINÉVO home" className="group flex items-baseline gap-1.5">
    <span className="font-display text-[22px] uppercase leading-none tracking-[0.24em] text-white transition-colors group-hover:text-white/90 sm:text-2xl">
      Cinévo
    </span>
    <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(229,9,20,0.9)]" />
  </Link>
)

export const Navbar = () => {
  const { pathname } = useRouterLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { city, cities, setCity } = useCity()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const cityRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setCityOpen(false)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (cityRef.current && !cityRef.current.contains(target)) setCityOpen(false)
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMenuOpen(false)
    toast.info('Signed out of the demo session.')
    navigate('/')
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-500',
          scrolled
            ? 'border-white/10 bg-ink-950/90 shadow-[0_10px_40px_-30px_rgba(0,0,0,1)] backdrop-blur-xl'
            : 'border-white/[0.06] bg-ink-950/55 backdrop-blur-md',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
          <div className="flex items-center gap-6 xl:gap-9">
            <Logo />
            <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex xl:gap-6">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative py-1 text-[11px] font-medium tracking-[0.04em] transition-colors',
                      isActive ? 'text-white' : 'text-white/55 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={cn(
                          'absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300',
                          isActive ? 'w-full' : 'w-0',
                        )}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div ref={cityRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setCityOpen((value) => !value)
                  setProfileOpen(false)
                }}
                aria-expanded={cityOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-white/25 hover:text-white"
              >
                <MapPin size={12} className="text-accent" />
                <span className="max-w-[90px] truncate">{city}</span>
                <ChevronDown size={11} className={cn('transition-transform', cityOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {cityOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    role="listbox"
                    aria-label="Select city"
                    className="absolute right-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-ink-900 p-1.5 shadow-2xl"
                  >
                    <p className="px-2.5 py-2 text-[8px] uppercase tracking-[0.18em] text-white/30">Choose city</p>
                    {cities.map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={option === city}
                        onClick={() => {
                          setCity(option)
                          setCityOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                          option === city ? 'bg-white/[0.06] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white',
                        )}
                      >
                        {option}
                        {option === city && <Check size={12} className="text-accent" />}
                      </button>
                    ))}
                    <p className="border-t border-white/10 px-2.5 pb-1.5 pt-2 text-[8px] leading-relaxed text-white/25">
                      Cinemas are currently listed for Hyderabad and Medak.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search movies"
              className="flex h-9 items-center gap-2 rounded-full border border-white/10 px-2.5 text-white/60 transition-colors hover:border-white/25 hover:text-white sm:px-3"
            >
              <Search size={15} />
              <span className="hidden text-[10px] uppercase tracking-[0.12em] lg:inline">Search</span>
              <kbd className="hidden rounded border border-white/10 px-1 py-0.5 font-mono text-[8px] text-white/30 xl:inline">⌘K</kbd>
            </button>

            {!isAuthenticated ? (
              <Link to="/login" className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-ink-950 transition-colors hover:bg-white/85 sm:flex">
                <User size={12} /> Sign in
              </Link>
            ) : (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((value) => !value)
                    setCityOpen(false)
                  }}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-white/10 p-0.5 pr-1.5 transition-colors hover:border-white/30"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(140deg, ${user?.avatarTone ?? '#5a1f14'}, #151515)` }}
                  >
                    {initials(user?.name ?? 'C')}
                  </span>
                  <ChevronDown size={12} className={cn('text-white/40 transition-transform', profileOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      role="menu"
                      className="absolute right-0 top-full z-10 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-900 p-1.5 shadow-2xl"
                    >
                      <div className="border-b border-white/10 px-2.5 pb-2.5 pt-1.5">
                        <p className="truncate text-xs font-medium text-white">{user?.name}</p>
                        <p className="mt-0.5 truncate text-[10px] text-white/40">{user?.email}</p>
                      </div>
                      <Link to="/profile" role="menuitem" className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/70 hover:bg-white/[0.05] hover:text-white">
                        <User size={13} /> Profile
                      </Link>
                      <Link to="/bookings" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/70 hover:bg-white/[0.05] hover:text-white">
                        <Ticket size={13} /> My Bookings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" role="menuitem" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-white/70 hover:bg-white/[0.05] hover:text-white">
                          <LayoutDashboard size={13} /> Admin dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-white/10 px-2.5 py-2 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white"
                      >
                        <LogOut size={13} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-white/25 hover:text-white lg:hidden"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-white/10 bg-ink-950/98 backdrop-blur-xl sm:top-20 lg:hidden"
          >
            <div className="container-page flex min-h-full flex-col py-6">
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV_ITEMS.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + index * 0.04, duration: 0.3 }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between border-b border-white/10 py-3.5 font-display text-2xl uppercase tracking-wide transition-colors',
                          isActive ? 'text-white' : 'text-white/55',
                        )
                      }
                    >
                      {item.label}
                      <span className="font-sans text-[9px] tracking-[0.18em] text-white/25">0{index + 1}</span>
                    </NavLink>
                  </motion.div>
                ))}
                <NavLink
                  to="/community"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between border-b border-white/10 py-3.5 font-display text-2xl uppercase tracking-wide',
                      isActive ? 'text-white' : 'text-white/55',
                    )
                  }
                >
                  Community
                  <span className="font-sans text-[9px] tracking-[0.18em] text-white/25">06</span>
                </NavLink>
              </nav>

              <div className="mt-6">
                <p className="mb-2.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-white/35">
                  <MapPin size={11} className="text-accent" /> City · sample cinemas
                </p>
                <div className="flex flex-wrap gap-2">
                  {cities.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCity(option)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-[11px] transition-colors',
                        option === city
                          ? 'border-accent bg-accent/15 text-white'
                          : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white',
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2.5 pb-6">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="btn-ghost w-full">
                      <User size={14} /> {user?.name}
                    </Link>
                    <Link to="/bookings" className="btn-ghost w-full">
                      <Ticket size={14} /> My Bookings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="btn-ghost w-full">
                        <LayoutDashboard size={14} /> Admin dashboard
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="btn bg-accent px-6 py-3 text-white">
                      <LogOut size={14} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-primary w-full">
                      Sign in
                    </Link>
                    <Link to="/register" className="btn-ghost w-full">
                      Create a demo account
                    </Link>
                  </>
                )}
                <p className="mt-2 text-center text-[9px] leading-relaxed text-white/25">
                  Frontend demo · no real payments, tickets or accounts.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
