import { useCountdown } from '../../hooks/useCountdown'
import { cn } from '../../utils/cn'

interface CountdownProps {
  target: string
  label?: string
  variant?: 'inline' | 'hero' | 'compact'
  className?: string
}

const pad = (value: number) => value.toString().padStart(2, '0')

export const Countdown = ({ target, label = 'Releases in', variant = 'inline', className }: CountdownProps) => {
  const countdown = useCountdown(target)

  if (countdown.isComplete) {
    return (
      <span className={cn('eyebrow inline-flex items-center gap-2 text-white/70', className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Now in cinemas
      </span>
    )
  }

  if (variant === 'compact') {
    const parts = [
      countdown.days ? `${countdown.days}d` : null,
      `${pad(countdown.hours)}h`,
      `${pad(countdown.minutes)}m`,
      `${pad(countdown.seconds)}s`,
    ].filter(Boolean)
    return (
      <span className={cn('font-mono text-[11px] tracking-[0.08em] text-white/80', className)}>
        {label && <span className="mr-2 text-[9px] uppercase tracking-[0.2em] text-muted">{label}</span>}
        {parts.join(' : ')}
      </span>
    )
  }

  const units =
    variant === 'hero'
      ? [
          { value: countdown.days, label: 'Days' },
          { value: countdown.hours, label: 'Hours' },
          { value: countdown.minutes, label: 'Mins' },
          { value: countdown.seconds, label: 'Secs' },
        ]
      : [
          { value: countdown.days, label: 'D' },
          { value: countdown.hours, label: 'H' },
          { value: countdown.minutes, label: 'M' },
          { value: countdown.seconds, label: 'S' },
        ]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && variant === 'hero' && (
        <span className="mr-1 hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-muted sm:block">
          {label}
        </span>
      )}
      <div className="flex items-end gap-2.5 sm:gap-3">
        {units.map((unit, index) => (
          <div key={unit.label} className="flex items-end gap-2.5 sm:gap-3">
            <div className="text-center">
              <span
                className={cn(
                  'block font-mono tabular-nums text-white',
                  variant === 'hero' ? 'text-xl sm:text-2xl' : 'text-sm',
                )}
              >
                {pad(unit.value)}
              </span>
              <span className="mt-0.5 block text-[8px] uppercase tracking-[0.18em] text-muted">
                {unit.label}
              </span>
            </div>
            {index < units.length - 1 && (
              <span className="mb-3 text-xs text-white/25">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
