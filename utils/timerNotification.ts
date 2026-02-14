import { NativeModules } from 'react-native';

interface TimerModuleType {
    startTimer(taskText: string, durationMinutes: number): void;
    stopTimer(): void;
}

const { TimerModule } = NativeModules;

export const startTimerNotification = (taskText: string, durationMinutes: number = 25) => {
    if (TimerModule) {
        TimerModule.startTimer(taskText, durationMinutes);
    } else {
        console.warn('TimerModule not available - notification will not show');
    }
};

export const stopTimerNotification = () => {
    if (TimerModule) {
        TimerModule.stopTimer();
    } else {
        console.warn('TimerModule not available');
    }
};
