/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#1A0F0A',
          surface: '#2D1810',
          gold: '#D4AF37',
          cream: '#F5F1E8',
          muted: '#A89070',
        },
      },
    },
  },
  plugins: [],
};
