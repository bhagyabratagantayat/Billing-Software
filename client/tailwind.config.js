/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a3c6e',
          light: '#2d5496',
          dark: '#0f2444'
        }
      }
    },
  },
  plugins: [],
}
