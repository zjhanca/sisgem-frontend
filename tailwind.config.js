/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg':     '#111827',
        'dark-card':   '#1F2937',
        'dark-border': '#374151',
        'light-bg':    '#FFFFFF',
        'light-card':  '#F9FAFB',
        'primary':     '#16A34A',
        'primary-mid': '#15803D',
        'dark-text':   '#F9FAFB',
        'light-text':  '#111827',
      }
    }
  },
  plugins: []
}