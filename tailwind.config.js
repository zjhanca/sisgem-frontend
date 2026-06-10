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
        'light-card':  '#F9FAFB',
        'primary':     '#FFFFFF',
        'secondary':   '#4ADE80',
        'dark-text':   '#F9FAFB',
        'light-text':  '#0F172A',
      }
    }
  },
  plugins: []
}