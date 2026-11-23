/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fbf8f5',
          100: '#f5efe8',
          200: '#ebdccf',
          300: '#dcbeaa',
          400: '#ca9b7f',
          500: '#bc7f5d',
          600: '#a86749',
          700: '#874f39',
          800: '#6f4233',
          900: '#5c382d',
          950: '#321c16',
        },
        warmgray: {
          50: '#f9f9f8',
          100: '#f1f1ee',
          200: '#e3e3df',
          300: '#cecec8',
          400: '#9d9d95',
          500: '#73736c',
          600: '#52524d',
          700: '#3f3f3b',
          800: '#2c2c29',
          900: '#1c1c1a',
        }
      },
    },
  },
  plugins: [],
}
