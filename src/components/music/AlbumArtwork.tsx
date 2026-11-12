import { Disc3 } from 'lucide-react'
import type { Album } from '../../types'
import { cn } from '../../utils/cn'
import { toneMix } from '../../utils/format'

export const AlbumArtwork = ({
  album,
  className,
  showDisc = true,
}: {
  album: Pick<Album, 'title' | 'movieTitle' | 'tone' | 'artist'>
  className?: string
  showDisc?: boolean
}) => (
  <div className={cn('grain relative isolate aspect-square w-full overflow-hidden bg-ink-850', className)} role="img" aria-label={`${album.title} album artwork`}>
    <div className="absolute inset-0" style={{ background: toneMix(album.tone) }} />
    <div
      className="absolute inset-0 opacity-70"
      style={{ background: `radial-gradient(60% 60% at 30% 25%, ${album.tone.glow}55, transparent 65%)` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(0,0,0,0.05),rgba(0,0,0,0.55))]" />
    <div className="absolute -right-1/4 -top-1/4 h-[90%] w-[90%] rounded-full border border-white/15" />
    <div className="absolute -right-1/6 -top-1/6 h-[70%] w-[70%] rounded-full border border-white/[0.08]" />

    {showDisc && (
      <div className="absolute right-[8%] top-[10%] flex h-[32%] w-[32%] items-center justify-center rounded-full border border-white/20 bg-black/25 backdrop-blur-sm">
        <div className="flex h-[78%] w-[78%] items-center justify-center rounded-full border border-white/10 bg-black/30">
          <Disc3 size={18} className="text-white/40" />
        </div>
      </div>
    )}

    <div className="relative flex h-full flex-col justify-between p-[7%]">
      <div className="flex items-start justify-between text-[8px] font-semibold uppercase tracking-[0.26em] text-white/60">
        <span>CINÉVO Sound</span>
        <span>Demo</span>
      </div>
      <div>
        <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-white/55">
          Original Soundtrack · {album.artist}
        </p>
        <h3 className="display-title line-clamp-3 text-[clamp(1.3rem,2.4vw,2.1rem)] leading-[0.9] text-white">
          {album.movieTitle}
        </h3>
        <p className="mt-2 line-clamp-1 font-serif text-[11px] italic text-white/55">{album.title}</p>
        <span className="mt-3 block h-px w-8 bg-accent" />
      </div>
    </div>
    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
  </div>
)
