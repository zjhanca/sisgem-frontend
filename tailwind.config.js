/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg':     '#081217',
        'dark-card':   '#0F1C22',
        'dark-border': '#1A3040',
        'light-bg':    '#FFFFFF',
        'light-card':  '#FFFFFF',
        'primary':     '#1E9E50',
        'primary-mid': '#178040',
        'dark-text':   '#EAF7EE',
        'light-text':  '#1D3326',
      }
    }
  },
  plugins: []
}