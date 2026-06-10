/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg':     '#0F1A14',
        'dark-card':   '#162018',
        'dark-border': '#243D2C',
        'light-bg':    '#FFFFFF',
        'light-card':  '#F8FAF9',
        'primary':     '#FFFFFF',
        'primary-mid': '#F0F7F2',
        'accent':      '#4CAF72',
        'accent-mid':  '#3D9960',
        'dark-text':   '#F0F7F2',
        'light-text':  '#0F1A14',
      }
    }
  },
  plugins: []
}