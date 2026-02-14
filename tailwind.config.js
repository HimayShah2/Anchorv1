/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'bg': '#000000',
        'surface': '#121212',
        'primary': '#4ADE80',
        'focus': '#38BDF8',
        'panic': '#EF4444',
        'dim': '#27272a',
        'accent': '#A78BFA',
      }
    },
  },
  plugins: [],
};
