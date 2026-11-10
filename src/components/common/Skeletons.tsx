import { cn } from '../../utils/cn'

const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-shimmer rounded-lg bg-white/[0.045] bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.03)_80%)] bg-[length:800px_100%]',
      className,
    )}
  />
)

export const PosterSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('space-y-3', className)}>
    <Shimmer className="aspect-[2/3] w-full rounded-xl" />
    <Shimmer className="h-3.5 w-3/4" />
    <Shimmer className="h-3 w-1/2" />
  </div>
)

export const RailSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: count }).map((_, index) => (
      <PosterSkeleton key={index} className="w-[190px] shrink-0 sm:w-[215px]" />
    ))}
  </div>
)

export const PageSkeleton = () => (
  <div className="container-page py-16">
    <Shimmer className="mb-4 h-3 w-24" />
    <Shimmer className="mb-10 h-12 w-2/3 max-w-xl" />
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <PosterSkeleton key={index} />
      ))}
    </div>
  </div>
)

export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2.5">
    {Array.from({ length: lines }).map((_, index) => (
      <Shimmer key={index} className={index === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
    ))}
  </div>
)

export { Shimmer }
