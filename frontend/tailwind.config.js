/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005BAC',
          light: '#3B82F6',
          dark: '#004C8C',
        },
        secondary: {
          DEFAULT: '#00AEEF',
          light: '#38BDF8',
          dark: '#0369A1',
        },
        accent: {
          DEFAULT: '#16A34A',
          light: '#4ADE80',
          dark: '#15803D',
        },
        bankdark: {
          DEFAULT: '#050816',
          card: '#0B0F19',
          border: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        stencil: ['"Big Shoulders Stencil Text"', 'cursive'],
      },
    },
  },
  plugins: [],
}
