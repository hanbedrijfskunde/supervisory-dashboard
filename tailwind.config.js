/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color - Space Indigo
        primary: {
          50: '#efeef6',
          100: '#e0deed',
          200: '#c0bcdc',
          300: '#a19bca',
          400: '#8279b9',
          500: '#6358a7',
          600: '#4f4686',
          700: '#3b3564',
          800: '#272343',
          900: '#141221',
          950: '#0e0c17',
        },
        // Danger/Error - Classic Crimson
        danger: {
          50: '#fbe9ec',
          100: '#f7d4d8',
          200: '#f0a8b2',
          300: '#e87d8b',
          400: '#e05265',
          500: '#d9263e',
          600: '#ad1f32',
          700: '#821725',
          800: '#570f19',
          900: '#2b080c',
          950: '#1e0509',
        },
        // Warning - Tiger Flame
        warning: {
          50: '#feece7',
          100: '#fcd8cf',
          200: '#fab29e',
          300: '#f78b6e',
          400: '#f5653d',
          500: '#f23e0d',
          600: '#c2320a',
          700: '#912508',
          800: '#611905',
          900: '#300c03',
          950: '#220902',
        },
        // Success - Verdigris
        success: {
          50: '#e9fbf9',
          100: '#d4f7f3',
          200: '#a8f0e7',
          300: '#7de8dc',
          400: '#52e0d0',
          500: '#26d9c4',
          600: '#1fad9d',
          700: '#178276',
          800: '#0f574e',
          900: '#082b27',
          950: '#051e1b',
        },
        // Secondary/Highlights - Lime Cream
        secondary: {
          50: '#f7faeb',
          100: '#eff4d7',
          200: '#dfeaae',
          300: '#cfdf86',
          400: '#bed45e',
          500: '#aec936',
          600: '#8ba12b',
          700: '#697920',
          800: '#465115',
          900: '#23280b',
          950: '#181c07',
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-in',
        'slide-in-right': 'slideInRight 200ms ease-out',
        'slide-in-up': 'slideInUp 200ms ease-out',
        'slide-in-down': 'slideInDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
