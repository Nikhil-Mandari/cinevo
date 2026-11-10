import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
  align?: 'left' | 'center'
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  align = 'left',
}: SectionHeadingProps) => (
  <div
    className={cn(
      'mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-9',
      align === 'center' && 'flex-col items-center text-center',
      className,
    )}
  >
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="display-title text-[clamp(1.7rem,2.6vw,2.5rem)] text-white">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
    </div>
    {actionLabel && actionHref && (
      <Link to={actionHref} className="link-underline group shrink-0 pb-1 text-[13px]">
        {actionLabel}
        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
)
