/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080808',
          925: '#0b0b0b',
          900: '#0e0e0e',
          850: '#111111',
          800: '#151515',
          750: '#191919',
          700: '#1f1f1f',
          600: '#2a2a2a',
        },
        accent: {
          DEFAULT: '#E50914',
          600: '#c80711',
          500: '#E50914',
          400: '#ff2c37',
          300: '#ff6a72',
        },
        muted: '#999999',
        fog: '#C9C9C9',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Bahnschrift', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.22em',
        widest3: '0.34em',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        floaty: 'floaty 7s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
