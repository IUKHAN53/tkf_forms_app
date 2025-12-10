/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        muted: '#64748B',
        card: '#0F172A',
      },
    },
  },
  plugins: [],
};
