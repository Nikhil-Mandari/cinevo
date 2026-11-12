import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { RequireAuth } from './components/common/RequireAuth'
import { Layout } from './components/layout/Layout'
import { AuthProvider } from './context/AuthContext'
import { LocationProvider } from './context/LocationContext'
import { MusicPlayerProvider } from './context/MusicPlayerContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { AdminPage } from './pages/Admin'
import { BookingPage } from './pages/Booking'
import { BookingsPage } from './pages/Bookings'
import { CinemasPage } from './pages/Cinemas'
import { ComingSoonPage } from './pages/ComingSoon'
import { CommunityPage } from './pages/Community'
import { ExplorePage } from './pages/Explore'
import { FaceOffPage } from './pages/FaceOff'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { MovieDetailsPage } from './pages/MovieDetails'
import { MusicPage } from './pages/Music'
import { MusicAlbumPage } from './pages/MusicAlbum'
import { NotFoundPage } from './pages/NotFound'
import { ProfilePage } from './pages/Profile'
import { RegisterPage } from './pages/Register'
import { SeatSelectionPage } from './pages/SeatSelection'
import { TicketPage } from './pages/Ticket'
import { WatchlistPage } from './pages/Watchlist'

export const App = () => (
  <BrowserRouter>
    <LocationProvider>
      <AuthProvider>
        <WatchlistProvider>
          <MusicPlayerProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="search" element={<ExplorePage />} />
                <Route path="coming-soon" element={<ComingSoonPage />} />
                <Route path="movies/:id" element={<MovieDetailsPage />} />
                <Route path="music" element={<MusicPage />} />
                <Route path="music/album/:movieId" element={<MusicAlbumPage />} />
                <Route path="community" element={<CommunityPage />} />
                <Route path="face-off" element={<FaceOffPage />} />
                <Route path="cinemas" element={<CinemasPage />} />
                <Route path="book/:movieId" element={<BookingPage />} />
                <Route path="book/:movieId/seats/:showtimeId" element={<SeatSelectionPage />} />
                <Route path="bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
                <Route path="bookings/:bookingId" element={<RequireAuth><TicketPage /></RequireAuth>} />
                <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                <Route path="watchlist" element={<WatchlistPage />} />
                <Route path="admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
            <ToastContainer
              position="bottom-right"
              theme="dark"
              autoClose={3400}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss={false}
              limit={3}
              aria-label="Notifications"
            />
          </MusicPlayerProvider>
        </WatchlistProvider>
      </AuthProvider>
    </LocationProvider>
  </BrowserRouter>
)
