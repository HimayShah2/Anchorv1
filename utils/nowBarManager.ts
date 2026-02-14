import { NativeModules, Platform } from 'react-native';

interface NowBarModuleType {
    checkNowBarAvailable(): Promise<boolean>;
    updateNowBar(taskText: string, timeRemainingMs: number): Promise<boolean>;
    clearNowBar(): Promise<boolean>;
    setNowBarClickAction(): Promise<boolean>;
}

const { NowBarModule } = NativeModules;

let nowBarAvailable: boolean | null = null;

/**
 * Check if Now Bar is available (Samsung One UI 8+)
 */
export const checkNowBarAvailable = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !NowBarModule) return false;

    if (nowBarAvailable === null) {
        try {
            nowBarAvailable = await NowBarModule.checkNowBarAvailable();
        } catch (error) {
            console.warn('Now Bar availability check error:', error);
            nowBarAvailable = false;
        }
    }

    return nowBarAvailable ?? false;
};

/**
 * Update Now Bar with current task
 */
export const updateNowBar = async (taskText: string, timeRemainingMs: number = 0): Promise<boolean> => {
    if (Platform.OS !== 'android' || !NowBarModule) return false;

    const available = await checkNowBarAvailable();
    if (!available) return false;

    try {
        await NowBarModule.updateNowBar(taskText, timeRemainingMs);
        console.log('Now Bar updated:', taskText);
        return true;
    } catch (error) {
        console.warn('Failed to update Now Bar:', error);
        return false;
    }
};

/**
 * Clear Now Bar
 */
export const clearNowBar = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !NowBarModule) return false;

    const available = await checkNowBarAvailable();
    if (!available) return false;

    try {
        await NowBarModule.clearNowBar();
        console.log('Now Bar cleared');
        return true;
    } catch (error) {
        console.warn('Failed to clear Now Bar:', error);
        return false;
    }
};

/**
 * Set click action to open app
 */
export const setNowBarClickAction = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !NowBarModule) return false;

    try {
        await NowBarModule.setNowBarClickAction();
        return true;
    } catch (error) {
        console.warn('Failed to set Now Bar click action:', error);
        return false;
    }
};
