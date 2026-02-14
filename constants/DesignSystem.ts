// Design System for Anchor App - Premium UI

export const colors = {
    // Primary Palette - Calm Ocean Blues
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',  // Main brand color
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
    },

    // Neutrals - Dark Mode Optimized
    dark: {
        bg: '#0a0a0a',        // Pure background
        surface: '#121212',   // Cards, elevated surfaces
        elevated: '#1a1a1a',  // Modals, tooltips
        border: '#2a2a2a',    // Subtle borders
        hover: '#252525',     // Hover states
    },

    // Semantic Colors
    success: '#10b981',     // Emerald
    warning: '#f59e0b',     // Amber
    error: '#ef4444',       // Red (use sparingly)
    info: '#3b82f6',        // Blue

    // Text
    text: {
        primary: '#ffffff',
        secondary: '#a1a1aa',
        tertiary: '#71717a',
        disabled: '#52525b',
    },

    // Status/Energy Colors
    energy: {
        depleted: '#7c3aed',  // Purple
        low: '#f59e0b',       // Amber
        medium: '#38bdf8',    // Sky
        good: '#10b981',      // Emerald
        excellent: '#06b6d4', // Cyan
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

export const typography = {
    // Use Inter font family (already in project)
    fontFamily: {
        sans: 'Inter, system-ui, -apple-system, sans-serif',
        mono: 'SF Mono, Monaco, monospace',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
    },
};

// Gradient Presets
export const gradients = {
    primary: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    energy: {
        1: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
        2: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        3: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
        4: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        5: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
};

// Animation Durations
export const animation = {
    fast: 150,
    normal: 250,
    slow: 350,
};
