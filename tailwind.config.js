/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      colors: {
        accent: '#7a9cff',
        alta:   '#ff4757',
        media:  '#ffa502',
        baja:   '#2ed573',
      },
    },
  },
  plugins: [],
}