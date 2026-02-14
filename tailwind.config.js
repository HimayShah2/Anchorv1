/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Premium Dark Mode Palette
        'bg': '#0a0a0a',
        'surface': '#121212',
        'elevated': '#1a1a1a',
        'dim': '#2a2a2a',

        // Primary - Calm Ocean Blues
        'primary': {
          DEFAULT: '#38bdf8',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },

        // Semantic Colors
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'focus': '#38bdf8',
        'panic': '#ef4444',
        'accent': '#8b5cf6',

        // Text
        'text-primary': '#ffffff',
        'text-secondary': '#a1a1aa',
        'text-tertiary': '#71717a',
        'text-disabled': '#52525b',

        // Energy Levels
        'energy': {
          1: '#7c3aed',
          2: '#f59e0b',
          3: '#38bdf8',
          4: '#10b981',
          5: '#06b6d4',
        },
      },
      spacing: {
        '18': '72px',
        '22': '88px',
      },
      borderRadius: {
        '4xl': '32px',
      },
      fontSize: {
        // Professional Typography Scale
        'xs': ['12px', { lineHeight: '18px', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.03em' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'normal': '0',
        'wide': '0.01em',
        'wider': '0.02em',
        'widest': '0.04em',
      },
    },
  },
  plugins: [],
};
