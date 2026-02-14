import * as Notifications from 'expo-notifications';
import { useStore } from '../store/useStore';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

let timerNotificationId: string | null = null;
let updateInterval: NodeJS.Timeout | null = null;

/**
 * Show persistent notification with timer countdown
 */
export const showTimerNotification = async (taskText: string, totalMinutes: number) => {
    const startTime = Date.now();
    const endTime = startTime + (totalMinutes * 60 * 1000);

    // Cancel existing notification if any
    await hideTimerNotification();

    // Create initial notification
    timerNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: '⏱️ Task in Progress',
            body: `${taskText}\n${formatTimeRemaining(endTime - startTime)}`,
            data: { taskText, startTime, endTime },
            sticky: true, // Android: make notification persistent
            priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
    });

    // Update notification every second
    updateInterval = setInterval(async () => {
        const remaining = endTime - Date.now();

        if (remaining <= 0) {
            // Timer complete
            await hideTimerNotification();
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '✅ Task Time Complete!',
                    body: taskText,
                    sound: true,
                },
                trigger: null,
            });
            return;
        }

        // Update existing notification
        if (timerNotificationId) {
            await Notifications.dismissNotificationAsync(timerNotificationId);
            timerNotificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏱️ Task in Progress',
                    body: `${taskText}\n${formatTimeRemaining(remaining)}`,
                    data: { taskText, startTime, endTime },
                    sticky: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null,
            });
        }
    }, 1000); // Update every second
};

/**
 * Hide timer notification
 */
export const hideTimerNotification = async () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    if (timerNotificationId) {
        await Notifications.dismissNotificationAsync(timerNotificationId);
        timerNotificationId = null;
    }
};

/**
 * Format milliseconds into readable time
 */
const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m remaining`;
    }

    return `${minutes}m ${seconds.toString().padStart(2, '0')}s remaining`;
};

/**
 * Initialize notification listeners
 */
export const initializeNotificationListeners = () => {
    // Handle notification tap
    Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;

        if (data.taskText) {
            // Open app to task screen
            // Router navigation would go here
        }
    });
};
