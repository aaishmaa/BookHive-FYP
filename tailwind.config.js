/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'alice': ['Alice', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'acadex-teal': '#2A8E9E',
        'acadex-dark': '#023347',
        'acadex-darker': '#013146',
        'acadex-light': '#E9F2F4',
        'acadex-yellow': '#FFDE09',
        'acadex-pink': '#F97BCD',
        'acadex-green': '#98EB7A',
        'acadex-red': '#FF3C3C',
        'acadex-orange': '#FF6426',
      },
    },
  },
  plugins: [],
}