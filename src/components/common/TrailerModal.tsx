import { Info } from 'lucide-react'
import { Modal } from './Modal'

interface TrailerModalProps {
  open: boolean
  onClose: () => void
  title: string
  trailerUrl: string | null
}

export const TrailerModal = ({ open, onClose, title, trailerUrl }: TrailerModalProps) => (
  <Modal open={open} onClose={onClose} title={`${title} · Trailer`} size="xl" className="p-0">
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
      {trailerUrl ? (
        <div className="aspect-video w-full">
          <iframe
            src={`${trailerUrl}?rel=0&modestbranding=1`}
            title={`${title} trailer`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center">
          <span className="rounded-full border border-white/15 p-3 text-muted">
            <Info size={20} />
          </span>
          <p className="font-display text-xl uppercase tracking-wide text-white">Trailer not attached yet</p>
          <p className="max-w-sm text-sm text-muted">
            This title has no trailer URL in the demo catalog. Add one from the Admin dashboard to preview it here.
          </p>
        </div>
      )}
    </div>
    <div className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
      <Info size={13} className="mt-0.5 shrink-0 text-accent" />
      <p>
        Demo preview. Trailer links are catalog fields — CINÉVO does not claim this reel as an official trailer for the
        title. Audio players elsewhere use royalty-free placeholder tracks.
      </p>
    </div>
  </Modal>
)
