/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ehr-cyan': '#00a5ff',
        'ehr-emerald': '#00ffa5',
      },
    },
  },
  plugins: [],
}
