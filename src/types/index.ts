/**
 * Shared domain types.
 *
 * These mirror the shape of the future Java Spring Boot REST resources
 * (movie-service, theatre-service, showtime-service, booking-service,
 * auth-service, user-service, music-service) so the mock service layer can be
 * swapped for HTTP calls without touching UI code.
 */

export type Language = 'Telugu' | 'Hindi' | 'English' | 'Tamil' | 'Kannada' | 'Malayalam'

export type MovieStatus = 'now-showing' | 'coming-soon'

export type SeatClass = 'classic' | 'premium' | 'recliner'

export type BookingStatus = 'confirmed' | 'cancelled'

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet'

export interface Person {
  name: string
  role: string
}

export interface Song {
  id: string
  title: string
  artist: string
  /** Duration in seconds, used until audio metadata loads. */
  duration: number
  audioUrl: string
  /** Every track in this build is royalty-free placeholder audio. */
  isDemo: boolean
  lyricist?: string
}

export interface PosterTone {
  from: string
  via: string
  to: string
  glow: string
  ink?: 'light' | 'dark'
}

export interface Movie {
  id: string
  slug: string
  title: string
  tagline: string
  synopsis: string
  genres: string[]
  languages: Language[]
  runtime: number
  releaseDate: string
  status: MovieStatus
  certificate: string
  director: string
  musicDirector: string
  cast: Person[]
  crew: Person[]
  songs: Song[]
  trailerUrl: string | null
  /** Optional real artwork. Empty means CINÉVO generates typographic artwork. */
  posterUrl?: string | null
  tone: PosterTone
  criticScore: number
  audienceScore: number
  popularity: number
  anticipation: number
  featured: boolean
  createdAt: string
}

export interface SeatLayout {
  rows: number
  cols: number
  /** Number of seats before the walkway. */
  aisleAfter: number
  premiumRows: string[]
  reclinerRows: string[]
}

export interface Screen {
  id: string
  name: string
  format: string
  seatLayout: SeatLayout
}

export interface Theatre {
  id: string
  name: string
  area: string
  city: string
  address: string
  amenities: string[]
  screens: Screen[]
}

export interface Showtime {
  id: string
  movieId: string
  theatreId: string
  screenId: string
  /** ISO date, yyyy-mm-dd */
  date: string
  /** 24h clock, e.g. 21:15 */
  time: string
  format: string
  language: Language
  basePrice: number
}

export interface Seat {
  id: string
  row: string
  number: number
  seatClass: SeatClass
  price: number
  status: 'available' | 'occupied'
}

export interface PriceBreakdown {
  ticketSubtotal: number
  convenienceFee: number
  gst: number
  total: number
  seatCount: number
}

export interface Booking {
  id: string
  userId: string
  movieId: string
  theatreId: string
  showtimeId: string
  showDate: string
  showTime: string
  screenName: string
  seats: string[]
  seatClasses: SeatClass[]
  ticketSubtotal: number
  convenienceFee: number
  gst: number
  total: number
  paymentMethod: PaymentMethod
  status: BookingStatus
  createdAt: string
  /** Denormalised snapshot so tickets survive catalog edits. */
  movieTitle: string
  theatreName: string
  posterTone: PosterTone
}

export interface Review {
  id: string
  movieId: string
  author: string
  rating: number
  title: string
  body: string
  createdAt: string
  verified: boolean
  likes: number
  spoiler?: boolean
}

export interface Discussion {
  id: string
  movieId: string
  author: string
  avatarTone: string
  message: string
  createdAt: string
  likes: number
  replies: number
  topic: string
}

export interface FaceOff {
  id: string
  movieAId: string
  movieBId: string
  title: string
  baseVotesA: number
  baseVotesB: number
  note: string
  closesOn: string
}

export interface VoteRecord {
  faceOffId: string
  movieId: string
  votedAt: string
}

export interface Album {
  id: string
  movieId: string
  movieTitle: string
  title: string
  artist: string
  year: string
  language: Language
  tone: PosterTone
  tracks: Song[]
  runtime: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  city: string
  role: 'user' | 'admin'
  avatarTone: string
  favouriteGenres: string[]
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
  issuedAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  name: string
  phone?: string
}

export interface ProfileUpdate {
  name: string
  phone: string
  city: string
  favouriteGenres: string[]
}

export interface SearchFilters {
  query?: string
  genre?: string
  language?: string
  status?: MovieStatus | 'all'
  sort?: 'popularity' | 'rating' | 'release' | 'title'
}

export interface Notification {
  id: string
  message: string
  tone?: 'default' | 'success' | 'error'
}
