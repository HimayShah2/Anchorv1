import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useStore } from '../store/useStore';

export const VisualTimer = () => {
    const timerStart = useStore(s => s.timerStart);
    const timerMinutes = useStore(s => s.settings.timerMinutes);
    const width = useSharedValue(100);

    useEffect(() => {
        if (!timerStart) {
            width.value = withTiming(100, { duration: 300 });
            return;
        }
        width.value = 100;
        width.value = withTiming(0, { duration: timerMinutes * 60 * 1000 });
    }, [timerStart, timerMinutes]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${width.value}%`,
    }));

    return (
        <View className="h-2 bg-dim w-full mt-6 rounded-full overflow-hidden">
            <Animated.View
                style={[animatedStyle, { height: '100%', backgroundColor: '#38BDF8', borderRadius: 9999 }]}
            />
        </View>
    );
};
