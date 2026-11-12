# CINÉVO

## Movie discovery. Ticket booking. Cinema, reimagined.

CINÉVO is a modern movie discovery and ticket booking platform built as a React frontend. It brings film discovery, cinema schedules, seat selection, simulated checkout, music, community features, and account experiences together in a cinematic interface.

The current application runs with mock services and browser-local data. A Java Spring Boot backend with Spring Security and JWT authentication is planned for the next stage.

## Features

- Movie discovery, browsing, search, filtering, and sorting
- Movie details, trailers, ratings, related titles, and showtimes
- Cinema and theatre browsing
- Showtime selection and interactive seat maps
- Booking flow with simulated payment and UPI QR checkout
- Booking history, ticket details, and demo cancellation
- Authentication and registration UI
- User profiles and local watchlist
- Music discovery, album pages, and in-app music player
- Community discussions and reviews
- Movie Face-Off voting
- Admin dashboard for the demo environment
- Responsive dark cinema-inspired design

## Screenshots and Demo

Screenshots and a hosted demo can be added here when they are available.

<!-- Add verified image links or deployment URLs here. -->

## Technology Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-14-EF008C?logo=framer&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_React-icons-F56565)
![React Toastify](https://img.shields.io/badge/React_Toastify-notifications-FF6B6B)

## Getting Started

### Prerequisites

- Node.js and npm
- Git

### Installation

```bash
git clone https://github.com/Nikhil-Mandari/cinevo.git
cd cinevo
npm install
npm run dev
```

The development server will print the local URL in the terminal.

## Available Commands

```bash
# Start the development server
npm run dev

# Type-check and create a production build
npm run build

# Run Oxlint
npm run lint

# Preview the production build locally
npm run preview
```

## Project Structure

```text
cinevo/
├── public/                 # Public static assets
├── src/
│   ├── assets/             # Static source assets
│   ├── components/
│   │   ├── booking/        # Seat maps, checkout, ticket, and QR UI
│   │   ├── common/         # Shared UI components and route guards
│   │   ├── layout/         # Navbar, footer, search, and page layout
│   │   ├── movie/          # Movie cards, rails, carousels, and actions
│   │   └── music/          # Album artwork, tracks, and player UI
│   ├── context/            # Auth, location, music player, and watchlist state
│   ├── data/               # Deterministic demo datasets
│   ├── hooks/              # Reusable React hooks
│   ├── pages/              # Route-level application pages
│   ├── services/           # API client and mock service layer
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Formatting, storage, artwork, and seat helpers
│   ├── App.css             # Unused legacy stylesheet
│   ├── App.tsx             # Router and provider composition
│   ├── index.css           # Tailwind and global styles
│   ├── main.tsx            # Application entrypoint
│   └── vite-env.d.ts       # Vite type declarations
├── index.html              # HTML shell and application metadata
├── package.json            # Scripts and dependencies
├── tailwind.config.js      # Tailwind theme and content configuration
└── vite.config.ts          # Vite configuration
```

## Mock Data and Current Limitations

CINÉVO is currently a frontend-only portfolio project:

- Movie, theatre, showtime, music, and community data come from local mock datasets and services.
- Authentication, profiles, bookings, reactions, and watchlists use browser local storage.
- Demo credentials and account data are not suitable for real user information.
- Payments are simulated. The UPI QR code is for demonstration only; no payment is verified or charged.
- Seat availability is deterministic demo data and is not synchronized across users or devices.
- The current mock service layer does not provide production-grade authorization, concurrency control, or persistence.

## Roadmap: Java Backend Integration

The planned backend will use Java and Spring Boot:

- Build REST APIs with Spring Boot
- Add Spring Security authentication and authorization
- Replace demo sessions with JWT-based access and refresh tokens
- Persist users, movies, theatres, showtimes, seats, bookings, reviews, and watchlists
- Add transactional seat reservation and booking workflows
- Integrate a real payment provider with server-side verification
- Add validation, centralized error handling, logging, and API documentation
- Add automated backend tests and deployment configuration

The frontend already centralizes service access so the mock layer can be replaced incrementally with REST-backed implementations.

## Author

**Nikhil Mandari**

- GitHub: [Nikhil-Mandari](https://github.com/Nikhil-Mandari)
- LinkedIn: [nikhilmandari](https://linkedin.com/in/nikhilmandari)

## Repository

[github.com/Nikhil-Mandari/cinevo](https://github.com/Nikhil-Mandari/cinevo)
