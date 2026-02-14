import { NativeModules } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CelebrationModule {
    celebrate(type: string): void;
    confetti(): void;
}

const { CelebrationModule } = NativeModules;

/**
 * Celebration manager for dopamine boost on task completion
 */

export const celebrateCompletion = async (taskCount: number = 1) => {
    // Haptic celebration
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show confetti for milestones
    if (taskCount % 5 === 0 && CelebrationModule) {
        CelebrationModule.confetti();
    }
};

export const celebrateStreak = async (days: number) => {
    if (days >= 3) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
};

export const gentleVibration = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
