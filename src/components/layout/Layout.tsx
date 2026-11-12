import { Outlet } from 'react-router-dom'
import { MiniPlayer } from '../music/MiniPlayer'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollToTop } from './ScrollToTop'

export const Layout = () => (
  <div className="flex min-h-screen flex-col bg-ink-950">
    <ScrollToTop />
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <MiniPlayer />
  </div>
)
