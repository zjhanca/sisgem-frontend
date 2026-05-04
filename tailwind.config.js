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
        'light-bg':    '#F4FFF6',
        'light-card':  '#DDF5E4',
        'primary':     '#A6E8B2',
        'primary-mid': '#7CCF92',
        'dark-text':   '#EAF7EE',
        'light-text':  '#1D3326',
      }
    }
  },
  plugins: []
}