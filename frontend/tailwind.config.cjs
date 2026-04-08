/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        dark: '#0F172A',
        background: '#F8FAFC',
        accent: '#FF5A4E'
      },
      borderRadius: {
        xl: '1rem'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(2,6,23,0.08)'
      }
    }
  },
  plugins: []
}
