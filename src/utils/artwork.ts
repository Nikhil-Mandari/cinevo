import type { PosterTone } from '../types'

export const PALETTES: PosterTone[] = [
  { from: '#2a1307', via: '#8a3d1c', to: '#f0b05c', glow: '#ffb45e' },
  { from: '#04161c', via: '#0f4c5c', to: '#79c7c0', glow: '#5de0d3' },
  { from: '#140d1f', via: '#4b2c6b', to: '#b28bff', glow: '#a07bff' },
  { from: '#1c0b06', via: '#7a2d16', to: '#d98b4a', glow: '#ff8d3d' },
  { from: '#12061a', via: '#5c1450', to: '#e050a8', glow: '#ff5cb8' },
  { from: '#04150f', via: '#0d4a3a', to: '#5fc9a0', glow: '#6effc8' },
]

export const randomTone = (): PosterTone => PALETTES[Math.floor(Math.random() * PALETTES.length)]

/** Generates readable artwork colours from a title when creating a new movie. */
export const toneFromTitle = (title: string): PosterTone => {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) % 997
  return PALETTES[hash % PALETTES.length]
}
