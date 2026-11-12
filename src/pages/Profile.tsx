import { BadgeCheck, CalendarDays, LogOut, Mail, MapPin, Phone, Save, Sparkles, Ticket, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { MovieRail } from '../components/movie/MovieRail'
import { useAuth } from '../context/AuthContext'
import { useLocation as useCity } from '../context/LocationContext'
import { useAsync } from '../hooks/useAsync'
import { movieService } from '../services/movieService'
import { userService } from '../services/userService'
import type { ProfileUpdate } from '../types'
import { cn } from '../utils/cn'
import { formatDate, initials, inr } from '../utils/format'

const GENRES = ['Action', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Historical', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller']

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth()
  const { cities, setCity } = useCity()
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileUpdate>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? cities[0],
    favouriteGenres: user?.favouriteGenres ?? [],
  })
  const [saving, setSaving] = useState(false)

  const { data: stats } = useAsync(
    () => (user ? userService.stats(user.id) : Promise.resolve(null)),
    [user?.id],
  )
  const { data: recommended } = useAsync(
    () => movieService.recommended(form.favouriteGenres),
    [form.favouriteGenres.join(',')],
  )

  if (!user) return null

  const update = <K extends keyof ProfileUpdate>(key: K, value: ProfileUpdate[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const toggleGenre = (genre: string) =>
    setForm((current) => ({
      ...current,
      favouriteGenres: current.favouriteGenres.includes(genre)
        ? current.favouriteGenres.filter((item) => item !== genre)
        : [...current.favouriteGenres, genre],
    }))

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error('Your profile needs a name.')
      return
    }
    setSaving(true)
    try {
      await updateProfile({ ...form, name: form.name.trim(), phone: form.phone.trim() })
      setCity(form.city)
      toast.success('Profile saved in this browser.')
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : 'Could not save the profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.info('Signed out of the demo session.')
    navigate('/')
  }

  return (
    <div>
      <section className="border-b border-white/10">
        <div className="container-page py-10 sm:py-14">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Account
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl text-white"
              style={{ background: `linear-gradient(145deg, ${user.avatarTone}, #151515)` }}
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="display-title text-[clamp(2rem,4.4vw,3.2rem)] text-white">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-accent-200">
                    <BadgeCheck size={10} /> Admin demo
                  </span>
                )}
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-white/40">
                <span className="flex items-center gap-1.5">
                  <Mail size={11} /> {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={11} /> Member since {formatDate(user.createdAt)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <form onSubmit={(event) => void handleSave(event)} className="surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow mb-1">Profile details</p>
              <p className="font-display text-lg uppercase tracking-wide text-white">How CINÉVO knows you</p>
            </div>
            <User size={16} className="text-white/25" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Name</span>
              <input value={form.name} onChange={(event) => update('name', event.target.value)} className="field" required />
            </label>
            <label className="block">
              <span className="label">Phone</span>
              <span className="relative block">
                <Phone size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 90000 00000" className="field pl-10" />
              </span>
            </label>
            <label className="block">
              <span className="label">Home city</span>
              <span className="relative block">
                <MapPin size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <select value={form.city} onChange={(event) => update('city', event.target.value)} className="field cursor-pointer pl-10">
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="block">
              <span className="label">Email <span className="normal-case tracking-normal text-white/20">(fixed)</span></span>
              <input value={user.email} readOnly disabled className="field cursor-not-allowed text-white/40" />
            </label>
          </div>

          <div className="mt-6">
            <span className="label">Favourite genres</span>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => {
                const active = form.favouriteGenres.includes(genre)
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors',
                      active ? 'border-accent bg-accent/15 text-white' : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white',
                    )}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-white/25">
              Used to pick suggestions below. Nothing is sent anywhere.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">Saved in this browser only</p>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-xs">
              <Save size={13} /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="surface p-5">
            <p className="eyebrow mb-4 flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent" /> Activity
            </p>
            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/40">Confirmed tickets</dt>
                <dd className="font-display text-xl leading-none text-white">{stats?.bookings ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/40">Upcoming shows</dt>
                <dd className="font-display text-xl leading-none text-white">{stats?.upcoming ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/40">Demo spend</dt>
                <dd className="font-display text-xl leading-none text-white">{inr(stats?.spent ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <dt className="text-white/40">Saved films</dt>
                <dd className="font-display text-xl leading-none text-white">{stats?.watchlist ?? 0}</dd>
              </div>
            </dl>
            <Link to="/bookings" className="btn-ghost mt-4 w-full px-4 py-2.5 text-[11px]">
              <Ticket size={13} /> My bookings
            </Link>
          </div>

          <div className="surface p-5">
            <p className="eyebrow mb-2">Session</p>
            <p className="text-[11px] leading-relaxed text-white/40">
              Demo credentials and sample data live in local storage. Signing out keeps tickets and watchlist intact.
            </p>
            <button type="button" onClick={handleLogout} className="btn-ghost mt-4 w-full px-4 py-2.5 text-[11px]">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </aside>
      </section>

      {recommended && recommended.length > 0 && (
        <section className="border-t border-white/10 py-12">
          <div className="container-page">
            <MovieRail
              eyebrow="Picked for you"
              title="Because you keep coming back"
              description="Genre-weighted sample picks from your profile."
              movies={recommended.slice(0, 8)}
              href="/explore"
            />
          </div>
        </section>
      )}
    </div>
  )
}
