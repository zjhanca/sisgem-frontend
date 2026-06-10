/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // modo oscuro
        'dark-bg':     '#0D1117',
        'dark-card':   '#161B22',
        'dark-border': '#21262D',
        'dark-text':   '#E6EDF3',
        // modo claro — base blanca
        'light-bg':    '#F6F8FA',
        'light-card':  '#FFFFFF',
        'light-text':  '#1C2128',
        // acento verde claro (similar al que ya tienes pero más vivo)
        'primary':     '#22C55E',
        'primary-mid': '#16A34A',
        'primary-dark':'#15803D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08)',
        'modal': '0 20px 60px -10px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    }
  },
  plugins: []
}