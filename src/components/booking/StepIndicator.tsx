import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'

interface StepIndicatorProps {
  steps: string[]
  current: number
  className?: string
}

export const StepIndicator = ({ steps, current, className }: StepIndicatorProps) => (
  <ol className={cn('flex w-full items-center gap-1 overflow-x-auto no-scrollbar sm:gap-2', className)} aria-label="Booking progress">
    {steps.map((step, index) => {
      const state = index < current ? 'done' : index === current ? 'active' : 'todo'
      return (
        <li key={step} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold tabular-nums transition-colors',
                state === 'done' && 'border-accent bg-accent text-white',
                state === 'active' && 'border-accent bg-accent/15 text-white',
                state === 'todo' && 'border-white/15 text-white/30',
              )}
            >
              {state === 'done' ? <Check size={11} /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden truncate text-[9px] font-semibold uppercase tracking-[0.14em] sm:block',
                state === 'todo' ? 'text-white/25' : 'text-white/75',
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <span className={cn('h-px flex-1', index < current ? 'bg-accent/60' : 'bg-white/10')} />
          )}
        </li>
      )
    })}
  </ol>
)
