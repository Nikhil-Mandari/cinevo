import { MOVIES } from '../data/movies'
import { THEATRES, generateShowtimes } from '../data/theatres'
import { DISCUSSIONS, REVIEWS } from '../data/community'
import type { Movie, Review, Showtime, Theatre, User } from '../types'
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from '../utils/storage'

export interface StoredUser extends User {
  /** Demo-only obfuscation. A real Spring Boot service will own hashing. */
  passwordDigest: string
}

export const digestPassword = (password: string): string => {
  try {
    return `demo$${window.btoa(encodeURIComponent(password))}`
  } catch {
    return `demo$${password
      .split('')
      .reverse()
      .join('')}`
  }
}

const SEED_USERS: StoredUser[] = [
  {
    id: 'user-demo',
    name: 'Aarav Sharma',
    email: 'demo@cinevo.in',
    phone: '+91 90000 12345',
    city: 'Hyderabad',
    role: 'user',
    avatarTone: '#8a3d1c',
    favouriteGenres: ['Telugu', 'Thriller', 'Drama'],
    createdAt: '2026-09-12T10:00:00.000Z',
    passwordDigest: digestPassword('demo1234'),
  },
  {
    id: 'user-admin',
    name: 'CINÉVO Studio',
    email: 'admin@cinevo.in',
    phone: '+91 90000 99999',
    city: 'Hyderabad',
    role: 'admin',
    avatarTone: '#4b2c6b',
    favouriteGenres: ['Action', 'Sci-Fi'],
    createdAt: '2026-08-01T10:00:00.000Z',
    passwordDigest: digestPassword('admin1234'),
  },
]

const ensureArray = <T>(key: string, seed: T[]): T[] => {
  const existing = readJSON<T[] | null>(key, null)
  if (existing && Array.isArray(existing)) return existing
  writeJSON(key, seed)
  return seed
}

export const db = {
  movies(): Movie[] {
    const movies = ensureArray<Movie>(STORAGE_KEYS.movies, MOVIES)
    const refreshed = movies.map((movie) => {
      const seed = MOVIES.find((item) => item.id === movie.id)
      if (!seed) return movie
      const usesSeedPoster = !movie.posterUrl || movie.posterUrl.includes('images.unsplash.com')
      return {
        ...movie,
        title: seed.title,
        trailerUrl: seed.trailerUrl,
        posterUrl: usesSeedPoster ? seed.posterUrl : movie.posterUrl,
      }
    })
    if (refreshed.some((movie, index) => JSON.stringify(movie) !== JSON.stringify(movies[index]))) {
      writeJSON(STORAGE_KEYS.movies, refreshed)
    }
    return refreshed
  },
  saveMovies(movies: Movie[]): Movie[] {
    writeJSON(STORAGE_KEYS.movies, movies)
    return movies
  },
  theatres(): Theatre[] {
    return ensureArray<Theatre>(STORAGE_KEYS.theatres, THEATRES)
  },
  saveTheatres(theatres: Theatre[]): Theatre[] {
    writeJSON(STORAGE_KEYS.theatres, theatres)
    return theatres
  },
  showtimes(): Showtime[] {
    const existing = readJSON<Showtime[] | null>(STORAGE_KEYS.showtimes, null)
    if (existing && Array.isArray(existing)) return existing
    const seed = generateShowtimes(this.movies(), this.theatres())
    writeJSON(STORAGE_KEYS.showtimes, seed)
    return seed
  },
  saveShowtimes(showtimes: Showtime[]): Showtime[] {
    writeJSON(STORAGE_KEYS.showtimes, showtimes)
    return showtimes
  },
  /** Rebuilds the rolling programme from the current catalog (admin action). */
  regenerateShowtimes(): Showtime[] {
    const seed = generateShowtimes(this.movies(), this.theatres())
    writeJSON(STORAGE_KEYS.showtimes, seed)
    return seed
  },
  users(): StoredUser[] {
    return ensureArray<StoredUser>(STORAGE_KEYS.users, SEED_USERS)
  },
  saveUsers(users: StoredUser[]): StoredUser[] {
    writeJSON(STORAGE_KEYS.users, users)
    return users
  },
  reviews(): Review[] {
    return ensureArray<Review>(STORAGE_KEYS.reviews, REVIEWS)
  },
  saveReviews(reviews: Review[]): Review[] {
    writeJSON(STORAGE_KEYS.reviews, reviews)
    return reviews
  },
  discussions() {
    return ensureArray(STORAGE_KEYS.discussions, DISCUSSIONS)
  },
  saveDiscussions(discussions: typeof DISCUSSIONS) {
    writeJSON(STORAGE_KEYS.discussions, discussions)
    return discussions
  },
  featuredIds(): string[] {
    const stored = readJSON<string[] | null>(STORAGE_KEYS.featured, null)
    if (stored) return stored
    const seeded = this.movies()
      .filter((movie) => movie.featured)
      .map((movie) => movie.id)
    writeJSON(STORAGE_KEYS.featured, seeded)
    return seeded
  },
  saveFeaturedIds(ids: string[]): string[] {
    writeJSON(STORAGE_KEYS.featured, ids)
    return ids
  },
  reset(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key === STORAGE_KEYS.session) return
      if (key === STORAGE_KEYS.users) return
      removeKey(key)
    })
  },
}

export { SEED_USERS }
