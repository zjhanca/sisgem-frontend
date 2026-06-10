/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg':     '#0D1F17',
        'dark-card':   '#122318',
        'dark-border': '#1E3D2A',
        'light-bg':    '#FFFFFF',
        'light-card':  '#F5FBF7',
        'primary':     '#3DBE6E',
        'primary-mid': '#2DA55A',
        'dark-text':   '#E8F5EC',
        'light-text':  '#1A2E22',
      }
    }
  },
  plugins: []
}