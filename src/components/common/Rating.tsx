import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

interface RatingProps {
  value: number
  max?: number
  showValue?: boolean
  size?: number
  className?: string
  label?: string
}

export const Rating = ({ value, max = 5, showValue = true, size = 12, className, label }: RatingProps) => {
  const stars = Array.from({ length: max }, (_, index) => index + 1 <= Math.round(value))
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={`${label ?? 'Rating'}: ${value} out of ${max}`}>
      <span className="flex items-center gap-0.5" aria-hidden>
        {stars.map((filled, index) => (
          <Star
            key={index}
            size={size}
            className={filled ? 'fill-accent text-accent' : 'fill-transparent text-white/25'}
            strokeWidth={1.5}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-[11px] font-semibold text-white/80">
          {value.toFixed(1)}
          <span className="text-white/35">/{max}</span>
        </span>
      )}
    </span>
  )
}
