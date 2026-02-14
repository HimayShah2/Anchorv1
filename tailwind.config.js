/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Default dark theme
        'bg': '#000000',
        'surface': '#121212',
        'primary': '#4ADE80',
        'focus': '#38BDF8',
        'panic': '#EF4444',
        'dim': '#27272a',
        'accent': '#A78BFA',

        // High contrast variants
        'hc-bg': '#000000',
        'hc-surface': '#0a0a0a',
        'hc-text': '#ffffff',
        'hc-primary': '#00ff00',
        'hc-focus': '#00ffff',
        'hc-dim': '#505050',
        'hc-border': '#a0a0a0',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
      fontSize: {
        // Accessibility font size presets
        'a11y-xs': ['10px', { lineHeight: '1.5' }],
        'a11y-sm': ['13px', { lineHeight: '1.5' }],
        'a11y-base': ['16px', { lineHeight: '1.6' }],
        'a11y-lg': ['20px', { lineHeight: '1.6' }],
        'a11y-xl': ['26px', { lineHeight: '1.7' }],
      },
    },
  },
  plugins: [],
};
