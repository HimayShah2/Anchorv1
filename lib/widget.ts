/**
 * Android Widget Task Handler
 * 
 * This file sets up the widget using react-native-android-widget.
 * The widget displays the current anchor task and a timer indicator.
 * 
 * NOTE: This requires `npx expo prebuild --platform android` to generate
 * the native android/ directory, then building a dev APK.
 */

import React from 'react';
import { useStore } from '../store/useStore';

// Widget name registration (used in app.json config)
export const WIDGET_NAME = 'AnchorWidget';

/**
 * Widget click handler — processes widget interactions
 * and deep links back into the app.
 */
export async function handleWidgetAction(action: string): Promise<void> {
    if (action === 'complete') {
        useStore.getState().completeTop();
    } else if (action === 'open') {
        // Deep link handled by expo-router via anchor:// scheme
    }
}

/**
 * Get current widget data for rendering
 */
export function getWidgetData() {
    const { stack, timerStart, settings } = useStore.getState();
    const anchor = stack[0];

    if (!anchor) {
        return {
            hasTask: false,
            taskText: 'Ready to Anchor',
            timerProgress: 0,
            stackSize: 0,
        };
    }

    let timerProgress = 0;
    if (timerStart) {
        const elapsed = Date.now() - timerStart;
        const total = settings.timerMinutes * 60 * 1000;
        timerProgress = Math.min(elapsed / total, 1);
    }

    return {
        hasTask: true,
        taskText: anchor.text,
        timerProgress,
        stackSize: stack.length,
    };
}
