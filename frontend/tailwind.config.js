/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#10b981",
          dark:    "#059669",
          light:   "#34d399",
        },
      },
    },
  },
  plugins: [],
};