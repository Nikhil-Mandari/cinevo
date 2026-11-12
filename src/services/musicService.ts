import type { Album, Movie, Song } from '../types'
import { db } from './db'
import { mockDelay } from './apiClient'

const toAlbum = (movie: Movie): Album => ({
  id: `album-${movie.id}`,
  movieId: movie.id,
  movieTitle: movie.title,
  title: `${movie.title} — Soundtrack Sessions`,
  artist: movie.musicDirector,
  year: movie.releaseDate.slice(0, 4),
  language: movie.languages[0],
  tone: movie.tone,
  tracks: movie.songs,
  runtime: movie.songs.reduce((total, song) => total + song.duration, 0),
})

export const musicService = {
  async albums(): Promise<Album[]> {
    await mockDelay(110)
    return db
      .movies()
      .filter((movie) => movie.songs.length > 0)
      .map(toAlbum)
      .sort((a, b) => b.year.localeCompare(a.year) || b.tracks.length - a.tracks.length)
  },

  async albumForMovie(movieId: string): Promise<Album | null> {
    await mockDelay(60)
    const movie = db.movies().find((item) => item.id === movieId)
    return movie && movie.songs.length ? toAlbum(movie) : null
  },

  async allTracks(): Promise<Array<Song & { movieTitle: string; albumId: string; tone: Movie['tone'] }>> {
    await mockDelay(90)
    return db
      .movies()
      .flatMap((movie) =>
        movie.songs.map((song) => ({
          ...song,
          movieTitle: movie.title,
          albumId: `album-${movie.id}`,
          tone: movie.tone,
        })),
      )
  },

  async searchAlbums(query: string): Promise<Album[]> {
    const term = query.trim().toLowerCase()
    const albums = await this.albums()
    if (!term) return albums
    return albums.filter(
      (album) =>
        album.title.toLowerCase().includes(term) ||
        album.artist.toLowerCase().includes(term) ||
        album.tracks.some((track) => track.title.toLowerCase().includes(term)),
    )
  },
}
