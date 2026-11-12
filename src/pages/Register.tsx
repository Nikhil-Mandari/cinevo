import { ArrowRight, KeyRound, LockKeyhole, Mail, Phone, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const safeNext = (params: URLSearchParams): string => {
  const next = params.get('next') ?? ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={next} replace />

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const session = await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      })
      toast.success(`Account created. Welcome, ${session.user.name.split(' ')[0]}.`)
      navigate(next, { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Account creation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="order-2 hidden flex-col gap-3 sm:flex lg:order-1">
          {[
            { title: 'Book in a few taps', copy: 'Sample showtimes, seat maps and a simulated checkout end in a demo e-ticket.' },
            { title: 'Keep a watchlist', copy: 'Save films and soundtracks to your browser profile.' },
            { title: 'Join the room', copy: 'Post sample discussions and vote in the face-offs.' },
          ].map((item, index) => (
            <div key={item.title} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <span className="font-display text-2xl leading-none text-white/15">0{index + 1}</span>
              <div>
                <p className="text-xs font-medium text-white">{item.title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-white/35">{item.copy}</p>
              </div>
            </div>
          ))}
          <p className="mt-2 flex items-start gap-2 text-[9px] leading-relaxed text-white/25">
            <LockKeyhole size={11} className="mt-0.5 shrink-0" />
            Demo accounts are stored unencrypted in local storage. Never reuse a real password here.
          </p>
        </div>

        <div className="surface order-1 p-6 sm:p-8 lg:order-2">
          <p className="eyebrow mb-2">New account</p>
          <h1 className="font-display text-2xl uppercase tracking-wide text-white">Create your demo seat</h1>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">
            No email verification, no real account — just a local profile so tickets and posts have a name.
          </p>

          <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
            <label className="block">
              <span className="label">Name</span>
              <span className="relative block">
                <User size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="Your name"
                  className="field pl-10"
                />
              </span>
            </label>

            <label className="block">
              <span className="label">Email</span>
              <span className="relative block">
                <Mail size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  placeholder="you@example.com"
                  className="field pl-10"
                />
              </span>
            </label>

            <label className="block">
              <span className="label">Phone <span className="normal-case tracking-normal text-white/20">(optional)</span></span>
              <span className="relative block">
                <Phone size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="+91 90000 00000"
                  className="field pl-10"
                />
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Password</span>
                <span className="relative block">
                  <KeyRound size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) => update('password', event.target.value)}
                    placeholder="6+ characters"
                    className="field pl-10"
                  />
                </span>
              </label>
              <label className="block">
                <span className="label">Confirm</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(event) => update('confirm', event.target.value)}
                  placeholder="Repeat password"
                  className="field"
                />
              </label>
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] leading-relaxed text-accent-200">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full px-5 py-3 text-xs">
              {submitting ? 'Creating account…' : 'Create account'} <ArrowRight size={14} />
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] text-white/35">
            Already have one?{' '}
            <Link to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-white/70 underline-offset-4 hover:text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
