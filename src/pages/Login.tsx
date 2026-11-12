import { ArrowRight, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { DEMO_CREDENTIALS } from '../services'
import { authService } from '../services/authService'

const safeNext = (params: URLSearchParams): string => {
  const next = params.get('next') ?? ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to={next} replace />

  const fill = (credentials: { email: string; password: string }) => {
    setEmail(credentials.email)
    setPassword(credentials.password)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const session = await login({ email, password })
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}.`)
      navigate(next, { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgot = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then request a reset.')
      return
    }
    try {
      const message = await authService.forgotPassword(email.trim())
      toast.info(message)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not start a reset.')
    }
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-accent" /> Welcome back
          </p>
          <h1 className="display-title text-[clamp(2.6rem,5.6vw,4.6rem)] text-white">
            Return to the <span className="serif-accent normal-case text-accent-300">dark</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Sign in to keep your demo tickets, watchlist and profile in one place. Everything is stored in this browser
            and tied to sample accounts.
          </p>

          <div className="mt-8 hidden gap-3 sm:grid">
            {[
              { icon: ShieldCheck, title: 'Demo accounts only', copy: 'No real emails, passwords or personal data are collected.' },
              { icon: Sparkles, title: 'Local-first', copy: 'Your session, tickets and watchlist never leave this device.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <item.icon size={15} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs font-medium text-white">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-white/35">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-lg uppercase tracking-wide text-white">Sign in</p>
            <LockKeyhole size={15} className="text-white/30" />
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <span className="relative block">
                <Mail size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="field pl-10"
                />
              </span>
            </label>

            <label className="block">
              <span className="label">Password</span>
              <span className="relative block">
                <KeyRound size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="field pl-10"
                />
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] leading-relaxed text-accent-200">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full px-5 py-3 text-xs">
              {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-[10px] text-white/35">
            <button type="button" onClick={() => void handleForgot()} className="transition-colors hover:text-white">
              Forgot password?
            </button>
            <Link to={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="transition-colors hover:text-white">
              Create an account
            </Link>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Demo access</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => fill(DEMO_CREDENTIALS.user)} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-white/25">
                <span className="block text-[10px] font-semibold text-white">Audience demo</span>
                <span className="mt-0.5 block truncate font-mono text-[9px] text-white/35">{DEMO_CREDENTIALS.user.email}</span>
              </button>
              <button type="button" onClick={() => fill(DEMO_CREDENTIALS.admin)} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-white/25">
                <span className="block text-[10px] font-semibold text-white">Admin demo</span>
                <span className="mt-0.5 block truncate font-mono text-[9px] text-white/35">{DEMO_CREDENTIALS.admin.email}</span>
              </button>
            </div>
            <p className="mt-2.5 text-[9px] leading-relaxed text-white/25">
              Seeded demo passwords: demo1234 (audience) and admin1234 (admin). Both accounts exist in this browser only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
