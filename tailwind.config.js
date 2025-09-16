/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // For library build: only include component files
    "./src/components/**/*.{js,ts,jsx,tsx}",
    // For dev build: include all source files
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
