import { NativeModules, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

interface TransitionTimerConfig {
    warningMinutes: number; // Minutes before end to show warning
    windingDownMinutes: number; // Minutes for winding down phase
}

const DEFAULT_CONFIG: TransitionTimerConfig = {
    warningMinutes: 5,
    windingDownMinutes: 2,
};

let transitionTimerId: NodeJS.Timeout | null = null;
let windingDownTimerId: NodeJS.Timeout | null = null;

/**
 * Transition timer manager - helps with context switching
 * Provides gentle warnings before task completion
 */

export const startTransitionTimer = async (
    durationMinutes: number,
    taskText: string,
    config: TransitionTimerConfig = DEFAULT_CONFIG
) => {
    // Clear any existing timers
    clearTransitionTimers();

    const durationMs = durationMinutes * 60 * 1000;
    const warningMs = durationMs - (config.warningMinutes * 60 * 1000);
    const windingDownMs = durationMs - (config.windingDownMinutes * 60 * 1000);

    // 5-minute warning
    if (warningMs > 0) {
        transitionTimerId = setTimeout(async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `⏳ ${config.warningMinutes} minutes left`,
                    body: `"${taskText}" - Start wrapping up soon`,
                    sound: null,
                    priority: Notifications.AndroidNotificationPriority.LOW,
                },
                trigger: { seconds: 0 },
            });
        }, warningMs);
    }

    // Winding down phase
    if (windingDownMs > 0 && windingDownMs > warningMs) {
        windingDownTimerId = setTimeout(async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🌅 Winding down...',
                    body: 'Time to bring this to a close',
                    sound: null,
                    priority: Notifications.AndroidNotificationPriority.LOW,
                },
                trigger: { seconds: 0 },
            });
        }, windingDownMs);
    }
};

export const clearTransitionTimers = () => {
    if (transitionTimerId) {
        clearTimeout(transitionTimerId);
        transitionTimerId = null;
    }
    if (windingDownTimerId) {
        clearTimeout(windingDownTimerId);
        windingDownTimerId = null;
    }
};

export const setHyperfocusMode = async (enabled: boolean, taskText: string) => {
    if (enabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎯 Hyperfocus Mode ON',
                body: `"${taskText}" - Buttons locked for 15 min`,
                sound: null,
                priority: Notifications.AndroidNotificationPriority.LOW,
            },
            trigger: { seconds: 0 },
        });
    }
};
