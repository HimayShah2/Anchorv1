import { NativeModules } from 'react-native';

interface WidgetModuleType {
    updateWidget(taskText: string, timeRemaining: number): void;
    clearWidget(): void;
}

const { WidgetModule } = NativeModules;

export const updateWidget = (taskText: string, timeRemaining: number = 0) => {
    if (WidgetModule) {
        WidgetModule.updateWidget(taskText, timeRemaining);
    } else {
        console.warn('WidgetModule not available');
    }
};

export const clearWidget = () => {
    if (WidgetModule) {
        WidgetModule.clearWidget();
    } else {
        console.warn('WidgetModule not available');
    }
};
