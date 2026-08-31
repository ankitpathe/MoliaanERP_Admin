/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#3fa9f5', // Light logo blue #3FA9F5
          500: '#1b8eeb',
          600: '#0c6ec9',
          700: '#035096', // Main logo blue #035096
          800: '#0a4275',
          900: '#0f3962',
          950: '#0a2441',
        }
      }
    },
  },
  plugins: [],
}
