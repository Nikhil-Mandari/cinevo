import { cn } from '../../utils/cn'

interface MockQRCodeProps {
  value: string
  size?: number
  className?: string
}

const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const hash = (value: string): number => {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const GRID = 25
const FINDERS: Array<[number, number]> = [
  [0, 0],
  [GRID - 7, 0],
  [0, GRID - 7],
]

const inFinder = (x: number, y: number): boolean =>
  FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7)

const finderCell = (x: number, y: number): boolean | null => {
  for (const [fx, fy] of FINDERS) {
    const dx = x - fx
    const dy = y - fy
    if (dx < 0 || dx > 6 || dy < 0 || dy > 6) continue
    const edge = dx === 0 || dx === 6 || dy === 0 || dy === 6
    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4
    return edge || core
  }
  return null
}

/**
 * A decorative, deterministic QR-style block. It is intentionally not a valid
 * QR code — demo tickets are not scannable.
 */
export const MockQRCode = ({ value, size = 132, className }: MockQRCodeProps) => {
  const random = mulberry32(hash(value))
  const cells: Array<{ x: number; y: number }> = []

  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      const finder = finderCell(x, y)
      if (finder === true) {
        cells.push({ x, y })
        continue
      }
      if (finder === false) continue
      if (inFinder(x, y)) continue
      if (random() > 0.52) cells.push({ x, y })
    }
  }

  // Legibility band across the middle, mimicking a logo cut-out.
  const bandY = 11
  const bandX = 9

  return (
    <div
      className={cn('inline-flex flex-col items-center gap-1.5 rounded-lg bg-white p-2.5', className)}
      style={{ width: size }}
      role="img"
      aria-label={`Demo QR code for booking ${value}. Decorative only, not scannable.`}
    >
      <svg viewBox={`0 0 ${GRID + 4} ${GRID + 4}`} className="h-auto w-full" shapeRendering="crispEdges">
        <rect width={GRID + 4} height={GRID + 4} fill="#ffffff" />
        <g transform="translate(2 2)" fill="#080808">
          {cells.map(({ x, y }) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
          ))}
        </g>
        <g transform={`translate(${bandX + 2} ${bandY + 2})`}>
          <rect width={7} height={3.2} rx={0.6} fill="#ffffff" />
          <rect x={0.6} y={0.6} width={5.8} height={2} rx={0.4} fill="#E50914" />
        </g>
      </svg>
      <span className="text-[6px] font-bold uppercase tracking-[0.28em] text-ink-950">CINÉVO · Demo</span>
    </div>
  )
}
