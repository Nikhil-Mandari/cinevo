import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Album, PosterTone, Song } from '../types'
import { clamp } from '../utils/format'

export interface PlayerTrack extends Song {
  albumId: string
  movieId: string
  movieTitle: string
  tone: PosterTone
}

interface MusicPlayerValue {
  queue: PlayerTrack[]
  current: PlayerTrack | null
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  repeat: boolean
  playAlbum: (album: Album, startIndex?: number) => void
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void
  toggle: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  close: () => void
  isCurrent: (trackId: string) => boolean
}

const MusicPlayerContext = createContext<MusicPlayerValue | null>(null)

const toPlayerTrack = (album: Album, song: Song): PlayerTrack => ({
  ...song,
  albumId: album.id,
  movieId: album.movieId,
  movieTitle: album.movieTitle,
  tone: album.tone,
})

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [queue, setQueue] = useState<PlayerTrack[]>([])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.75)
  const [muted, setMuted] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const current = queue[index] ?? null

  // Single audio element for the whole app.
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.volume = 0.75
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => {
      setIsLoading(false)
      setError(null)
    }
    const onPause = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      setError('This demo track could not load. Check your connection and try again.')
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('error', onError)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('error', onError)
      audioRef.current = null
    }
  }, [])

  const loadAndPlay = useCallback((track: PlayerTrack | null) => {
    const audio = audioRef.current
    if (!audio) return
    if (!track) {
      audio.pause()
      audio.removeAttribute('src')
      setIsPlaying(false)
      return
    }
    setError(null)
    setIsLoading(true)
    setCurrentTime(0)
    setDuration(track.duration)
    audio.src = track.audioUrl
    audio.currentTime = 0
    const promise = audio.play()
    if (promise) {
      promise.catch((reason: DOMException) => {
        if (reason.name === 'AbortError') return
        setIsLoading(false)
        setIsPlaying(false)
        setError('Playback was blocked or the demo audio is unreachable. Tap play to retry.')
      })
    }
  }, [])

  const playTrack = useCallback((track: PlayerTrack, nextQueue?: PlayerTrack[]) => {
    const resolvedQueue = nextQueue && nextQueue.length ? nextQueue : [track]
    const resolvedIndex = Math.max(
      0,
      resolvedQueue.findIndex((item) => item.id === track.id),
    )
    setQueue(resolvedQueue)
    setIndex(resolvedIndex)
  }, [])

  const playAlbum = useCallback((album: Album, startIndex = 0) => {
    const tracks = album.tracks.map((song) => toPlayerTrack(album, song))
    if (!tracks.length) return
    const safeIndex = clamp(startIndex, 0, tracks.length - 1)
    setQueue(tracks)
    setIndex(safeIndex)
  }, [])

  // The single source of playback: whenever the selected track object changes
  // (new album, next, previous) load it and start playing.
  useEffect(() => {
    if (!current) return
    loadAndPlay(current)
  }, [current, loadAndPlay])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) {
      setError(null)
      void audio.play().catch(() => {
        setError('Playback was blocked or the demo audio is unreachable. Tap play to retry.')
      })
    } else {
      audio.pause()
    }
  }, [current])

  const next = useCallback(() => {
    setIndex((currentIndex) => {
      if (!queue.length) return 0
      const nextIndex = (currentIndex + 1) % queue.length
      return nextIndex
    })
  }, [queue.length])

  const previous = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }
    if (queue.length <= 1) {
      if (audio) {
        audio.currentTime = 0
        void audio.play()
      }
      return
    }
    setIndex((currentIndex) => (currentIndex - 1 + queue.length) % queue.length)
  }, [queue.length])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    const safe = clamp(seconds, 0, Number.isFinite(audio.duration) ? audio.duration : seconds)
    audio.currentTime = safe
    setCurrentTime(safe)
  }, [])

  const setVolume = useCallback(
    (nextVolume: number) => {
      const audio = audioRef.current
      const safe = clamp(nextVolume, 0, 1)
      setVolumeState(safe)
      setMuted(safe === 0)
      if (audio) {
        audio.volume = safe
        audio.muted = safe === 0
      }
    },
    [],
  )

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const nextMuted = !muted
    audio.muted = nextMuted
    setMuted(nextMuted)
  }, [muted])

  const close = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
    }
    setQueue([])
    setIndex(0)
    setIsPlaying(false)
    setError(null)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  // Auto-advance.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0
        void audio.play()
        return
      }
      if (queue.length > 1) {
        setIndex((currentIndex) => (currentIndex + 1) % queue.length)
      } else {
        setIsPlaying(false)
      }
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [queue.length, repeat])

  const value = useMemo<MusicPlayerValue>(
    () => ({
      queue,
      current,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      muted,
      repeat,
      playAlbum,
      playTrack,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleRepeat: () => setRepeat((value) => !value),
      close,
      isCurrent: (trackId: string) => current?.id === trackId,
    }),
    [
      queue,
      current,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      muted,
      repeat,
      playAlbum,
      playTrack,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      close,
    ],
  )

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>
}

export const useMusicPlayer = (): MusicPlayerValue => {
  const context = useContext(MusicPlayerContext)
  if (!context) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider')
  return context
}
