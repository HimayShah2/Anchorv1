import { NativeModules } from 'react-native';

interface BrainWidgetModule {
    updateWidget(title: string, content: string, noteCount: number): void;
    clearWidget(): void;
}

const { BrainWidgetModule } = NativeModules;

export const updateBrainWidget = (title: string, content: string, noteCount: number) => {
    if (BrainWidgetModule) {
        BrainWidgetModule.updateWidget(title, content, noteCount);
    }
};

export const clearBrainWidget = () => {
    if (BrainWidgetModule) {
        BrainWidgetModule.clearWidget();
    }
};
