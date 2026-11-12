/**
 * Service layer entry point.
 *
 * UI code should import from here rather than reaching into mock data, so the
 * whole app can be repointed at the Spring Boot APIs by setting
 * VITE_API_BASE_URL (see .env.example).
 */
export { movieService } from './movieService'
export { theatreService } from './theatreService'
export { showtimeService } from './showtimeService'
export { bookingService, type BookingDraft } from './bookingService'
export { authService, DEMO_CREDENTIALS } from './authService'
export { userService } from './userService'
export { musicService } from './musicService'
export { communityService, type VoteTally } from './communityService'
export { isMockMode, ApiError } from './apiClient'
