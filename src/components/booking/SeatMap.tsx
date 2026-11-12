import type { Screen, Seat } from '../../types'
import { cn } from '../../utils/cn'
import { inr } from '../../utils/format'
import { rowLabel, seatClassLabel } from '../../utils/seats'

interface SeatMapProps {
  screen: Screen
  seats: Seat[]
  selected: string[]
  onToggle: (seat: Seat) => void
  className?: string
}

const classDot: Record<Seat['seatClass'], string> = {
  classic: 'bg-white/25',
  premium: 'bg-amber-300/70',
  recliner: 'bg-violet-300/70',
}

const seatTone: Record<Seat['seatClass'], string> = {
  classic: 'border-white/20 bg-white/[0.06] text-white/50 hover:border-white/60 hover:bg-white/20',
  premium: 'border-amber-300/35 bg-amber-300/[0.09] text-amber-100/70 hover:border-amber-200/70 hover:bg-amber-300/20',
  recliner: 'border-violet-300/35 bg-violet-300/[0.09] text-violet-100/70 hover:border-violet-200/70 hover:bg-violet-300/20',
}

export const SeatMap = ({ screen, seats, selected, onToggle, className }: SeatMapProps) => {
  const rows = [...new Set(seats.map((seat) => seat.row))]
  const classPrices = (['classic', 'premium', 'recliner'] as const)
    .map((seatClass) => ({
      seatClass,
      price: seats.filter((seat) => seat.seatClass === seatClass).reduce((min, seat) => Math.min(min, seat.price), Infinity),
    }))
    .filter((entry) => Number.isFinite(entry.price))

  return (
    <div className={cn('surface overflow-hidden', className)}>
      <div className="border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
            {screen.name} · {screen.format}
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
            {selected.length} selected · max 10
          </p>
        </div>
      </div>

      <div className="overflow-x-auto px-2 py-6 sm:px-6">
        <div className="mx-auto" style={{ minWidth: Math.max(320, screen.seatLayout.cols * 27 + 64) }}>
          <div className="mb-8 px-8">
            <div
              className="h-8 w-full"
              style={{
                borderTop: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(229,9,20,0.22), rgba(229,9,20,0.04) 55%, transparent 75%)',
              }}
            />
            <p className="mt-2 text-center text-[8px] uppercase tracking-[0.34em] text-white/30">Screen this way</p>
          </div>

          <div className="space-y-1.5">
            {rows.map((row) => {
              const rowSeats = seats.filter((seat) => seat.row === row).sort((a, b) => a.number - b.number)
              return (
                <div key={row} className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="w-5 shrink-0 text-center font-mono text-[9px] text-white/30">{row}</span>
                  <div className="flex items-center gap-1">
                    {rowSeats.map((seat) => {
                      const isSelected = selected.includes(seat.id)
                      const isSold = seat.status === 'occupied'
                      return (
                        <span key={seat.id} className="flex items-center">
                          <button
                            type="button"
                            disabled={isSold}
                            onClick={() => onToggle(seat)}
                            aria-pressed={isSelected}
                            aria-label={`Seat ${seat.id}, ${seatClassLabel(seat.seatClass)}, ${inr(seat.price)}${isSold ? ', sold' : ''}`}
                            title={`${seat.id} · ${seatClassLabel(seat.seatClass)} · ${inr(seat.price)}${isSold ? ' · Sold' : ''}`}
                            className={cn(
                              'h-5 w-5 rounded-t-[5px] rounded-b-[2px] border text-[7px] font-medium transition-colors duration-150 sm:h-6 sm:w-6 sm:text-[8px]',
                              isSold
                                ? 'cursor-not-allowed border-transparent bg-white/[0.055] text-transparent'
                                : isSelected
                                  ? 'border-white bg-accent text-white shadow-[0_0_14px_rgba(229,9,20,0.55)]'
                                  : seatTone[seat.seatClass],
                            )}
                          >
                            {isSold ? '' : seat.number}
                          </button>
                          {seat.number === screen.seatLayout.aisleAfter && <span className="w-3 sm:w-5" aria-hidden />}
                        </span>
                      )
                    })}
                  </div>
                  <span className="w-5 shrink-0 text-center font-mono text-[9px] text-white/30">{row}</span>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-[9px] uppercase tracking-[0.2em] text-white/25">
            {rowLabel(rows.length)} rows · {screen.seatLayout.cols} seats per row · all seats are sample data
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 px-4 py-3 sm:px-6">
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/45">
          <span className="h-3 w-3 rounded-t-sm border border-white/20 bg-white/[0.06]" /> Available
        </span>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/45">
          <span className="h-3 w-3 rounded-t-sm bg-accent" /> Selected
        </span>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/45">
          <span className="h-3 w-3 rounded-t-sm bg-white/[0.055]" /> Sold
        </span>
        <span className="hidden h-3 w-px bg-white/10 sm:block" />
        {classPrices.map(({ seatClass, price }) => (
          <span key={seatClass} className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-white/45">
            <span className={cn('h-1.5 w-1.5 rounded-full', classDot[seatClass])} />
            {seatClassLabel(seatClass)} · {inr(price)}
          </span>
        ))}
      </div>
    </div>
  )
}
