import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});

export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === 'granted';
}

export async function scheduleTimerNotification(timerMinutes: number): Promise<string | null> {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    // Cancel any existing timer notifications
    await cancelTimerNotification();

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: '⚓ Timer Complete',
            body: `Your ${timerMinutes}-minute focus session is done!`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            ...(Platform.OS === 'android' && {
                channelId: 'anchor-timer',
            }),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: timerMinutes * 60,
        },
    });

    return id;
}

export async function cancelTimerNotification(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyReminder(hour: number): Promise<string | null> {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: '⚓ Time to Anchor',
            body: 'Start your focus session for today!',
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute: 0,
        },
    });

    return id;
}

// Setup Android notification channel
export async function setupNotificationChannel(): Promise<void> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('anchor-timer', {
            name: 'Timer Notifications',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4ADE80',
            sound: 'default',
        });
    }
}
