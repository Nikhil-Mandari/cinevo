import { Compass } from 'lucide-react'
import { EmptyState } from '../components/common/EmptyState'

export const NotFoundPage = () => (
  <div className="container-page py-20 sm:py-28">
    <p className="eyebrow mb-4 flex items-center gap-2">
      <span className="h-px w-8 bg-accent" /> Error 404
    </p>
    <EmptyState
      icon={Compass}
      title="This frame was cut"
      description="The page you followed is not part of the CINÉVO demo. The projector is still running — head back to the catalog."
      actionLabel="Explore the catalog"
      actionHref="/explore"
      className="border-solid bg-ink-900"
    />
  </div>
)
