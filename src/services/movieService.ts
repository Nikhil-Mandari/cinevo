import type { Movie, SearchFilters } from '../types'
import { api, isMockMode, mockDelay } from './apiClient'
import { db } from './db'
import { createId } from '../utils/storage'

const query = (filters: SearchFilters): string => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, String(value))
  })
  const string = params.toString()
  return string ? `?${string}` : ''
}

const sortByPopularity = (a: Movie, b: Movie) => b.popularity - a.popularity

const matches = (movie: Movie, filters: SearchFilters): boolean => {
  const q = (filters.query ?? '').trim().toLowerCase()
  if (q) {
    const haystack = [
      movie.title,
      movie.tagline,
      movie.director,
      movie.musicDirector,
      ...movie.genres,
      ...movie.languages,
      ...movie.cast.map((person) => person.name),
      ...movie.crew.map((person) => person.name),
    ]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(q)) return false
  }
  if (filters.genre && filters.genre !== 'all' && !movie.genres.includes(filters.genre)) return false
  if (filters.language && filters.language !== 'all' && !movie.languages.includes(filters.language as Movie['languages'][number]))
    return false
  if (filters.status && filters.status !== 'all' && movie.status !== filters.status) return false
  return true
}

const sortMovies = (movies: Movie[], sort: SearchFilters['sort']): Movie[] => {
  const list = [...movies]
  switch (sort) {
    case 'rating':
      return list.sort((a, b) => b.criticScore - a.criticScore)
    case 'release':
      return list.sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
    case 'title':
      return list.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return list.sort(sortByPopularity)
  }
}

export const movieService = {
  async list(filters: SearchFilters = {}): Promise<Movie[]> {
    if (!isMockMode()) return api.get<Movie[]>(`/api/movies${query(filters)}`)
    await mockDelay()
    const all = db.movies()
    return sortMovies(all.filter((movie) => matches(movie, filters)), filters.sort)
  },

  async getById(id: string): Promise<Movie | null> {
    if (!isMockMode()) return api.get<Movie>(`/api/movies/${id}`)
    await mockDelay(80)
    return db.movies().find((movie) => movie.id === id) ?? null
  },

  async getBySlug(slug: string): Promise<Movie | null> {
    await mockDelay(80)
    return db.movies().find((movie) => movie.slug === slug || movie.id === slug) ?? null
  },

  async featured(): Promise<Movie[]> {
    const ids = db.featuredIds()
    const movies = db.movies()
    const ordered = ids
      .map((id) => movies.find((movie) => movie.id === id))
      .filter((movie): movie is Movie => Boolean(movie))
    return ordered.length ? ordered : movies.filter((movie) => movie.featured)
  },

  async trending(): Promise<Movie[]> {
    return db
      .movies()
      .filter((movie) => movie.status === 'now-showing')
      .sort(sortByPopularity)
      .slice(0, 12)
  },

  async mostAnticipated(): Promise<Movie[]> {
    return [...db.movies()].sort((a, b) => b.anticipation - a.anticipation).slice(0, 12)
  },

  async latest(): Promise<Movie[]> {
    return [...db.movies()]
      .sort((a, b) => +new Date(b.releaseDate) - +new Date(a.releaseDate))
      .slice(0, 12)
  },

  async upcoming(): Promise<Movie[]> {
    return db
      .movies()
      .filter((movie) => movie.status === 'coming-soon')
      .sort((a, b) => +new Date(a.releaseDate) - +new Date(b.releaseDate))
  },

  async teluguPopular(): Promise<Movie[]> {
    return db
      .movies()
      .filter((movie) => movie.languages.includes('Telugu'))
      .sort(sortByPopularity)
      .slice(0, 12)
  },

  async topRated(): Promise<Movie[]> {
    return [...db.movies()].sort((a, b) => b.criticScore - a.criticScore).slice(0, 10)
  },

  async recommended(favouriteGenres: string[]): Promise<Movie[]> {
    const movies = db.movies()
    const scored = movies.map((movie) => {
      const genreHits = movie.genres.filter((genre) => favouriteGenres.includes(genre)).length
      return { movie, score: genreHits * 30 + movie.popularity / 4 + movie.criticScore / 6 }
    })
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ movie }) => movie)
  },

  async related(id: string): Promise<Movie[]> {
    const movies = db.movies()
    const movie = movies.find((item) => item.id === id)
    if (!movie) return []
    return movies
      .filter((item) => item.id !== id)
      .map((item) => ({
        item,
        score:
          item.genres.filter((genre) => movie.genres.includes(genre)).length * 10 +
          item.languages.filter((language) => movie.languages.includes(language)).length * 4 +
          item.popularity / 20,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item)
  },

  async create(payload: Omit<Movie, 'id' | 'createdAt'>): Promise<Movie> {
    if (!isMockMode()) return api.post<Movie>('/api/movies', payload)
    await mockDelay(150)
    const movies = db.movies()
    const id = createId('mv')
    const movie: Movie = { ...payload, id, createdAt: new Date().toISOString() }
    db.saveMovies([movie, ...movies])
    return movie
  },

  async update(id: string, patch: Partial<Movie>): Promise<Movie> {
    if (!isMockMode()) return api.put<Movie>(`/api/movies/${id}`, patch)
    await mockDelay(150)
    const movies = db.movies()
    const updated = movies.map((movie) => (movie.id === id ? { ...movie, ...patch, id } : movie))
    db.saveMovies(updated)
    return updated.find((movie) => movie.id === id) as Movie
  },

  async remove(id: string): Promise<void> {
    if (!isMockMode()) return api.delete<void>(`/api/movies/${id}`)
    await mockDelay(120)
    db.saveMovies(db.movies().filter((movie) => movie.id !== id))
    db.saveFeaturedIds(db.featuredIds().filter((movieId) => movieId !== id))
  },

  async setFeatured(ids: string[]): Promise<string[]> {
    await mockDelay(80)
    return db.saveFeaturedIds(ids)
  },

  async resetDemoData(): Promise<void> {
    db.reset()
    db.movies()
    db.theatres()
    db.showtimes()
    await mockDelay(100)
  },
}
