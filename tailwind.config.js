/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4afbe',
          400: '#ed8598',
          500: '#e35b76',
          600: '#c93d5a',
          700: '#7B2D42',
          800: '#6b2739',
          900: '#5a213f',
        },
        secondary: {
          50: '#fdfbf3',
          100: '#faf5e0',
          200: '#f4e8bb',
          300: '#ebd68e',
          400: '#e0c35f',
          500: '#C9A84C',
          600: '#b89537',
          700: '#997628',
          800: '#7a5c23',
          900: '#644b1e',
        },
        background: '#FAF7F4',
        foreground: '#1E1E1E',
        accent: '#E8C4C4',
        muted: '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
