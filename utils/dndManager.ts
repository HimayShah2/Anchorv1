import { NativeModules, Platform } from 'react-native';

interface DNDModuleType {
    checkDNDPermission(): Promise<boolean>;
    requestDNDPermission(): void;
    enableDND(): Promise<boolean>;
    disableDND(): Promise<boolean>;
    isDNDEnabled(): Promise<boolean>;
}

const { DNDModule } = NativeModules;

let dndEnabled = false;

/**
 * Request Do Not Disturb permission
 * Opens Android Settings for user to grant permission
 */
export const requestDNDPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DNDModule) return false;

    try {
        const hasPermission = await DNDModule.checkDNDPermission();
        if (!hasPermission) {
            // Open Settings page for user to grant permission
            DNDModule.requestDNDPermission();
            return false;
        }
        return true;
    } catch (error) {
        console.warn('DND permission error:', error);
        return false;
    }
};

/**
 * Alias for settings screen compatibility
 */
export const requestDNDPermissions = requestDNDPermission;

/**
 * Check if app has DND permission
 */
export const hasDNDPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DNDModule) return false;

    try {
        return await DNDModule.checkDNDPermission();
    } catch (error) {
        console.warn('DND permission check error:', error);
        return false;
    }
};

/**
 * Enable Do Not Disturb mode
 * Requires permission to be granted first
 */
export const enableDND = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DNDModule) return false;

    try {
        const success = await DNDModule.enableDND();
        if (success) {
            dndEnabled = true;
            console.log('DND enabled');
        }
        return success;
    } catch (error) {
        console.warn('Failed to enable DND:', error);
        return false;
    }
};

/**
 * Disable Do Not Disturb mode
 */
export const disableDND = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DNDModule) return false;

    try {
        const success = await DNDModule.disableDND();
        if (success) {
            dndEnabled = false;
            console.log('DND disabled');
        }
        return success;
    } catch (error) {
        console.warn('Failed to disable DND:', error);
        return false;
    }
};

/**
 * Check if DND is currently enabled
 */
export const isDNDEnabled = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DNDModule) return false;

    try {
        return await DNDModule.isDNDEnabled();
    } catch (error) {
        console.warn('DND status check error:', error);
        return dndEnabled;
    }
};
