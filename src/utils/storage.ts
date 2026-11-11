const PREFIX = 'cinevo'

export const STORAGE_KEYS = {
  movies: `${PREFIX}.catalog.movies.v1`,
  theatres: `${PREFIX}.catalog.theatres.v1`,
  showtimes: `${PREFIX}.catalog.showtimes.v1`,
  bookings: `${PREFIX}.bookings.v1`,
  users: `${PREFIX}.users.v1`,
  session: `${PREFIX}.session.v1`,
  watchlist: `${PREFIX}.watchlist.v1`,
  votes: `${PREFIX}.votes.v1`,
  reviews: `${PREFIX}.reviews.v1`,
  discussions: `${PREFIX}.discussions.v1`,
  reactions: `${PREFIX}.reactions.v1`,
  recentSearches: `${PREFIX}.searches.v1`,
  playlist: `${PREFIX}.playlist.v1`,
  location: `${PREFIX}.location.v1`,
  featured: `${PREFIX}.featured.v1`,
  votesSeed: `${PREFIX}.votes.seed.v1`,
} as const

export const readJSON = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const writeJSON = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage disabled — demo continues in memory */
  }
}

export const removeKey = (key: string): void => {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const createId = (prefix: string): string => {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${random}`
}
