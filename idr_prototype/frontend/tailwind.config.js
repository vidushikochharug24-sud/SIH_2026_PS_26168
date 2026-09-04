/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'idr-bg-start': '#0B0A1F',
        'idr-bg-mid': '#150E2E',
        'idr-bg-end': '#0D1626',
        'idr-green': '#2EE6A6',
        'idr-teal': '#1FBF9C',
        'idr-violet': '#B24BF3',
        'idr-purple': '#8B6FD9',
        'idr-blue': '#4FA3FF',
        'idr-text-main': '#E8E6F5',
        'idr-text-muted': '#8B87A8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
