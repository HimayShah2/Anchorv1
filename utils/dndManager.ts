import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';

/**
 * Do Not Disturb Manager
 * Handles DND/Silent mode integration for focused work sessions
 */

let originalInterruptionFilter: number | null = null;

// Check if DND permissions are granted
export async function checkDNDPermissions(): Promise<boolean> {
    try {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('DND permission check error:', error);
        return false;
    }
}

// Request DND permissions
export async function requestDNDPermissions(): Promise<boolean> {
    try {
        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'To enable Do Not Disturb mode automatically, please grant notification permissions. You may also need to enable DND access in system settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('DND permission request error:', error);
        return false;
    }
}

// Enable Do Not Disturb mode
export async function enableDND(): Promise<boolean> {
    try {
        const hasPermission = await checkDNDPermissions();
        if (!hasPermission) {
            return false;
        }

        if (Platform.OS === 'android') {
            // On Android, we can set notification channel importance
            // This is a simplified version - full DND requires native module
            await Notifications.setNotificationChannelAsync('anchor-dnd', {
                name: 'Anchor Focus Mode',
                importance: Notifications.AndroidImportance.LOW,
                sound: null,
                vibrationPattern: null,
                enableVibrate: false,
                enableLights: false,
            });

            console.log('DND mode enabled (notification suppression)');
            return true;
        } else if (Platform.OS === 'ios') {
            // iOS doesn't allow apps to control DND directly
            // User must enable Focus mode manually
            console.log('iOS: Please enable Focus mode manually');
            return false;
        }

        return false;
    } catch (error) {
        console.error('Enable DND error:', error);
        return false;
    }
}

// Disable Do Not Disturb mode
export async function disableDND(): Promise<boolean> {
    try {
        if (Platform.OS === 'android') {
            // Restore normal notification settings
            await Notifications.setNotificationChannelAsync('anchor-dnd', {
                name: 'Anchor Focus Mode',
                importance: Notifications.AndroidImportance.DEFAULT,
            });

            console.log('DND mode disabled');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Disable DND error:', error);
        return false;
    }
}

// Show DND instructions for manual setup
export function showDNDInstructions() {
    const message = Platform.OS === 'ios'
        ? 'On iOS: Swipe down from the top-right corner and tap Focus to enable Do Not Disturb mode during your work sessions.'
        : 'On Android: Swipe down from the top and tap Do Not Disturb to enable silent mode during your work sessions.';

    Alert.alert(
        'Do Not Disturb Setup',
        message,
        [
            { text: 'Got it', style: 'default' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
    );
}
