/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#334155',
        accent: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B'
      }
    },
  },
  plugins: [],
}