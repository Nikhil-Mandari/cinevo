import type { Language, Movie, PosterTone } from '../types'

export const inr = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`

export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hours) return `${mins}m`
  return mins ? `${hours}h ${mins}m` : `${hours}h`
}

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatDate = (iso: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-IN', options ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatDay = (iso: string): string =>
  formatDate(iso, { weekday: 'short' }).toUpperCase()

export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}K`
  return `${value}`
}

export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export const showtimeLabel = (time: string): string => {
  const [rawHour, rawMinute] = time.split(':').map(Number)
  const suffix = rawHour >= 12 ? 'PM' : 'AM'
  const hour = rawHour % 12 === 0 ? 12 : rawHour % 12
  return `${hour}:${`${rawMinute}`.padStart(2, '0')} ${suffix}`
}

/** 24h time to minutes since midnight — used for rolling "next show" chips. */
export const minutesFromTime = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const toneGradient = (tone: PosterTone, angle = 145): string =>
  `linear-gradient(${angle}deg, ${tone.from} 0%, ${tone.via} 52%, ${tone.to} 100%)`

export const toneMix = (tone: PosterTone): string =>
  `radial-gradient(90% 70% at 78% 12%, ${tone.glow}55 0%, transparent 60%), radial-gradient(70% 60% at 10% 90%, ${tone.via}aa 0%, transparent 70%), linear-gradient(150deg, ${tone.from} 0%, ${tone.via} 55%, ${tone.to} 100%)`

export const languageLabel = (languages: Language[]): string => languages.join(' · ')

export const movieMeta = (movie: Movie): string =>
  `${movie.certificate} · ${formatRuntime(movie.runtime)} · ${movie.languages.join(', ')}`

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))
