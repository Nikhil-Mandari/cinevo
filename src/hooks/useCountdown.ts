import { useEffect, useMemo, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isComplete: boolean
}

const diffToParts = (target: number): Countdown => {
  const total = Math.max(0, target - Date.now())
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
    isComplete: total === 0,
  }
}

/** Ticking countdown to an ISO date/time. Pauses when the tab is hidden. */
export const useCountdown = (targetIso: string): Countdown => {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso])
  const [countdown, setCountdown] = useState<Countdown>(() => diffToParts(target))

  useEffect(() => {
    const tick = () => setCountdown(diffToParts(target))
    tick()
    const id = window.setInterval(tick, 1000)
    const onVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [target])

  return countdown
}
