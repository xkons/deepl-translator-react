module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      spacing: {
        '30': '30px',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('tailwind-caret-color')(),],
}
