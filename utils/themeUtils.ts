import { useStore } from '../store/useStore';

/**
 * Get dynamic font size classes based on accessibility settings
 */
export const useFontSize = () => {
    const { settings } = useStore();

    const fontSizeMap = {
        small: {
            xs: 'text-[10px]',
            sm: 'text-[12px]',
            base: 'text-[14px]',
            lg: 'text-[16px]',
            xl: 'text-[18px]',
            '2xl': 'text-[20px]',
            '3xl': 'text-[24px]',
        },
        medium: {
            xs: 'text-xs',
            sm: 'text-sm',
            base: 'text-base',
            lg: 'text-lg',
            xl: 'text-xl',
            '2xl': 'text-2xl',
            '3xl': 'text-3xl',
        },
        large: {
            xs: 'text-sm',
            sm: 'text-base',
            base: 'text-lg',
            lg: 'text-xl',
            xl: 'text-2xl',
            '2xl': 'text-3xl',
            '3xl': 'text-4xl',
        },
        xlarge: {
            xs: 'text-base',
            sm: 'text-lg',
            base: 'text-xl',
            lg: 'text-2xl',
            xl: 'text-3xl',
            '2xl': 'text-4xl',
            '3xl': 'text-5xl',
        },
    };

    return fontSizeMap[settings.fontSize || 'medium'];
};

/**
 * Get theme colors based on theme setting and high contrast mode
 */
export const useThemeColors = () => {
    const { settings } = useStore();
    const isLight = settings.theme === 'light';
    const highContrast = settings.highContrast;

    if (highContrast) {
        // High contrast colors
        return isLight ? {
            bg: '#FFFFFF',
            surface: '#F5F5F5',
            text: '#000000',
            textSecondary: '#1A1A1A',
            primary: '#0066CC',
            focus: '#CC0000',
            dim: '#333333',
            border: '3px', // Thicker borders
        } : {
            bg: '#000000',
            surface: '#1A1A1A',
            text: '#FFFFFF',
            textSecondary: '#E5E5E5',
            primary: '#66B3FF',
            focus: '#FF6666',
            dim: '#CCCCCC',
            border: '3px',
        };
    }

    // Normal contrast
    return isLight ? {
        bg: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#09090B',
        textSecondary: '#52525B',
        primary: '#4ADE80',
        focus: '#38BDF8',
        dim: '#D4D4D8',
        border: '1px',
    } : {
        bg: '#000000',
        surface: '#121212',
        text: '#FFFFFF',
        textSecondary: '#71717A',
        primary: '#4ADE80',
        focus: '#38BDF8',
        dim: '#27272A',
        border: '1px',
    };
};

/**
 * Get Tailwind class names based on current theme
 */
export const useThemedClasses = () => {
    const colors = useThemeColors();
    const { settings } = useStore();

    return {
        bg: settings.theme === 'light' ? 'bg-white' : 'bg-black',
        surface: settings.theme === 'light' ? 'bg-gray-100' : 'bg-surface',
        text: settings.theme === 'light' ? 'text-black' : 'text-white',
        textSecondary: settings.theme === 'light' ? 'text-gray-700' : 'text-gray-500',
        primary: settings.theme === 'light' ? 'bg-green-500' : 'bg-primary',
        focus: settings.theme === 'light' ? 'bg-blue-500' : 'bg-focus',
        dim: settings.theme === 'light' ? 'bg-gray-300' : 'bg-dim',
        border: settings.highContrast ? 'border-2' : 'border',
    };
};

/**
 * Get animation duration based on reduce animations setting
 */
export const useAnimationDuration = () => {
    const { settings } = useStore();
    return settings.reduceAnimations ? 0 : 300;
};
