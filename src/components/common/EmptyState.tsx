import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center',
      className,
    )}
  >
    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-ink-850 text-muted">
      <Icon size={20} strokeWidth={1.5} />
    </span>
    <h3 className="font-display text-xl uppercase tracking-wide text-white">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
    {actionLabel && actionHref && (
      <Link to={actionHref} className="btn-primary mt-6 px-5 py-2.5 text-xs">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && !actionHref && (
      <button type="button" onClick={onAction} className="btn-primary mt-6 px-5 py-2.5 text-xs">
        {actionLabel}
      </button>
    )}
  </div>
)
