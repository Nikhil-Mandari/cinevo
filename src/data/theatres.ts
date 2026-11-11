import type { Movie, Screen, SeatLayout, Showtime, Theatre } from '../types'

/** Current supported booking locations for the demo. */
export const CITIES = ['Hyderabad', 'Medak'] as const

const layout = (rows: number, cols: number, premiumRows: string[], reclinerRows: string[] = []): SeatLayout => ({
  rows,
  cols,
  aisleAfter: Math.floor(cols / 2),
  premiumRows,
  reclinerRows,
})

const screens = (prefix: string): Screen[] => [
  {
    id: `${prefix}-s1`,
    name: 'Screen 01',
    format: '4K Dolby Atmos',
    seatLayout: layout(12, 18, ['J', 'K', 'L'], ['L']),
  },
  {
    id: `${prefix}-s2`,
    name: 'Screen 02',
    format: 'IMAX Laser',
    seatLayout: layout(14, 20, ['K', 'L', 'M', 'N']),
  },
  {
    id: `${prefix}-s3`,
    name: 'Screen 03',
    format: '2K Surround',
    seatLayout: layout(10, 16, ['H', 'I'], ['I']),
  },
]

export const THEATRES: Theatre[] = [
  {
    id: 'amb-cinemas-gachibowli',
    name: 'AMB Cinemas',
    area: 'Gachibowli',
    city: 'Hyderabad',
    address: 'Sarath City Capital Mall, Gachibowli–Miyapur Road, Kondapur, Hyderabad, Telangana 500084',
    amenities: ['Recliners', 'Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'],
    screens: screens('amb'),
  },
  {
    id: 'prasads-multiplex-khairatabad',
    name: 'Prasads Multiplex',
    area: 'Khairatabad',
    city: 'Hyderabad',
    address: 'IMAX Road, NTR Marg, near NTR Gardens, Hyderabad, Telangana 500063',
    amenities: ['IMAX', 'Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'],
    screens: [
      {
        id: 'pr-s1',
        name: 'PCX',
        format: 'IMAX Laser',
        seatLayout: layout(16, 22, ['N', 'O', 'P'], ['P']),
      },
    ],
  },
  {
    id: 'pvr-icon-hitech',
    name: 'PVR INOX: PVR ICON',
    area: 'Madhapur',
    city: 'Hyderabad',
    address: 'Next Galleria Mall, Hitech City, Madhapur, Hyderabad, Telangana 500081',
    amenities: ['Recliners', 'Dolby Atmos', 'Parking', 'Food Court'],
    screens: screens('pvrh'),
  },
  {
    id: 'pvr-nexus-kukatpally',
    name: 'PVR INOX: Nexus Mall Kukatpally',
    area: 'Kukatpally',
    city: 'Hyderabad',
    address: 'Nexus Mall, KPHB Phase 6, Kukatpally, Hyderabad, Telangana 500072',
    amenities: ['Recliners', 'Dolby Atmos', 'Parking', 'Food Court'],
    screens: screens('pvrs'),
  },
  {
    id: 'aaa-cinemas-ameerpet',
    name: 'AAA Cinemas',
    area: 'Ameerpet',
    city: 'Hyderabad',
    address: 'Satyam Theatre Road, X Road, Kumar Basti, Ameerpet, Hyderabad, Telangana 500082',
    amenities: ['Dolby Atmos', 'Parking', 'Food Court', 'Wheelchair Access'],
    screens: screens('aaa'),
  },
  {
    id: 'allu-cinemas-kokapet',
    name: 'ALLU Cinemas',
    area: 'Kokapet',
    city: 'Hyderabad',
    address: 'Plot 20, adjacent to Allu Studios, Narsingi, Hyderabad, Telangana 500075',
    amenities: ['Premium Seats', 'Dolby Atmos', 'Parking', 'Food Court'],
    screens: [
      {
        id: 'allu-s1',
        name: 'Main Screen',
        format: '4K Dolby Atmos',
        seatLayout: layout(14, 20, ['K', 'L', 'M'], ['M']),
      },
    ],
  },
  {
    id: 'asian-lakshmikala-moosapet',
    name: 'Asian Lakshmikala Cinepride',
    area: 'Moosapet',
    city: 'Hyderabad',
    address: 'Street Number 4, SP Nagar, Bharat Nagar, Moosapet, Hyderabad, Telangana 500018',
    amenities: ['Dolby 7.1', 'Parking', 'Snack Bar'],
    screens: [
      {
        id: 'lak-s1',
        name: 'Main Hall',
        format: '2K Dolby 7.1',
        seatLayout: layout(16, 22, ['N', 'O', 'P']),
      },
    ],
  },
  {
    id: 'asian-sai-datta-medak',
    name: 'Asian Sai Datta Picture Palace',
    area: 'Auto Nagar',
    city: 'Medak',
    address: 'Auto Nagar, Medak, Telangana',
    amenities: ['Telugu Movies', 'Parking', 'Snack Bar'],
    screens: [
      {
        id: 'sai-s1',
        name: 'Main Hall',
        format: '2K Surround',
        seatLayout: layout(14, 20, ['L', 'M', 'N']),
      },
    ],
  },
  {
    id: 'mukta-a2-medak',
    name: 'Mukta A2 Cinemas',
    area: 'Medak',
    city: 'Medak',
    address: 'Medak town, Medak district, Telangana',
    amenities: ['Recliners', 'Dolby Atmos', 'Parking', 'Food Court'],
    screens: screens('mukta'),
  },
]

const TIMES = ['10:30', '13:45', '16:30', '19:15', '22:20']

const hash = (value: string): number => {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export const isoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export const startOfToday = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Builds a rolling 9-day showtime programme starting at each movie's release
 * date. Generated values are persisted by the mock database so admin edits
 * remain stable between visits.
 */
export const generateShowtimes = (movies: Movie[], theatres: Theatre[]): Showtime[] => {
  const today = startOfToday()
  const out: Showtime[] = []

  movies.forEach((movie, movieIndex) => {
    if (movie.status === 'coming-soon') return
    const release = new Date(`${movie.releaseDate}T00:00:00`)
    const firstDay = release > today ? release : today

    for (let offset = 0; offset < 9; offset += 1) {
      const date = isoDate(addDays(firstDay, offset))
      theatres.forEach((theatre, theatreIndex) => {
        theatre.screens.forEach((screen, screenIndex) => {
          const seed = hash(`${movie.id}${theatre.id}${screen.id}${date}`)
          if ((seed + movieIndex + theatreIndex) % 5 === 0) return

          const count = 2 + (seed % 3)
          for (let i = 0; i < count; i += 1) {
            const time = TIMES[(seed + i * 2 + screenIndex) % TIMES.length]
            const premiumTheatre = screen.format.includes('IMAX') || theatre.id === 'cinevo-central'
            const basePrice = (premiumTheatre ? 320 : 210) + (theatre.id === 'sunset-talkies' ? -70 : 0) + (screenIndex % 2) * 30
            out.push({
              id: `st-${movie.id}-${theatre.id}-${screen.id}-${date}-${i}`,
              movieId: movie.id,
              theatreId: theatre.id,
              screenId: screen.id,
              date,
              time,
              format: screen.format,
              language: movie.languages[(seed + i) % movie.languages.length],
              basePrice,
            })
          }
        })
      })
    }
  })

  return out
}
