import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/DesignSystem';

interface IconProps {
    size?: number;
    color?: string;
}

// Anchor Icon - Minimalist geometric design
export const AnchorIcon = ({ size = 24, color = colors.primary[400] }: IconProps) => (
    <View style={{ width: size, height: size }}>
        {/* SVG-like anchor shape using View components */}
        <View style={[styles.anchorVertical, { backgroundColor: color, height: size * 0.7, width: size * 0.1, marginLeft: size * 0.45 }]} />
        <View style={[styles.anchorCross, { backgroundColor: color, height: size * 0.1, width: size * 0.6, marginLeft: size * 0.2, marginTop: size * 0.25 }]} />
        <View style={[styles.anchorLeft, { backgroundColor: color, height: size * 0.25, width: size * 0.25, marginTop: size * 0.05, borderRadius: size * 0.125 }]} />
        <View style={[styles.anchorRight, { backgroundColor: color, height: size * 0.25, width: size * 0.25, marginLeft: size * 0.5, marginTop: -size * 0.25, borderRadius: size * 0.125 }]} />
    </View>
);

// Timer Icon
export const TimerIcon = ({ size = 24, color = colors.primary[400] }: IconProps) => (
    <View style={[styles.circle, { width: size, height: size, borderColor: color, borderWidth: 2 }]}>
        <View style={[styles.timerHand, { backgroundColor: color, height: size * 0.4, width: 2, marginTop: size * 0.1 }]} />
    </View>
);

// Energy Icon (battery-like)
export const EnergyIcon = ({ size = 24, color = colors.primary[400], level = 3 }: IconProps & { level?: number }) => {
    const fillHeight = (level / 5) * size * 0.6;
    return (
        <View style={[styles.battery, { width: size * 0.7, height: size, borderColor: color, borderWidth: 2 }]}>
            <View style={[styles.batteryTip, { backgroundColor: color, width: size * 0.3, height: size * 0.1, marginLeft: size * 0.2, marginTop: -size * 0.05 }]} />
            <View style={[styles.batteryFill, { backgroundColor: color, height: fillHeight, marginTop: size * 0.6 - fillHeight }]} />
        </View>
    );
};

// Task Icon (check square)
export const TaskIcon = ({ size = 24, color = colors.primary[400] }: IconProps) => (
    <View style={[styles.square, { width: size, height: size, borderColor: color, borderWidth: 2 }]}>
        <Text style={[styles.checkmark, { color, fontSize: size * 0.7 }]}>✓</Text>
    </View>
);

// Brain Icon (simplified)
export const BrainIcon = ({ size = 24, color = colors.primary[400] }: IconProps) => (
    <View style={{ width: size, height: size }}>
        <View style={[styles.circle, { width: size, height: size, borderColor: color, borderWidth: 2 }]} />
        <View style={[styles.braindots, { backgroundColor: color, width: 3, height: 3, borderRadius: 1.5, marginTop: -size * 0.7, marginLeft: size * 0.3 }]} />
        <View style={[styles.braindots, { backgroundColor: color, width: 3, height: 3, borderRadius: 1.5, marginTop: size * 0.2, marginLeft: size * 0.6 }]} />
    </View>
);

// Settings Icon (gear)
export const SettingsIcon = ({ size = 24, color = colors.primary[400] }: IconProps) => (
    <View style={[styles.circle, { width: size, height: size, borderColor: color, borderWidth: 2 }]}>
        <View style={[styles.innerCircle, { width: size * 0.4, height: size * 0.4, backgroundColor: color, borderRadius: size * 0.2, marginLeft: size * 0.3, marginTop: size * 0.3 }]} />
    </View>
);

// Plus Icon
export const PlusIcon = ({ size = 24, color = colors.primary[400] }: IconProps) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: color, height: size, width: 2 }} />
        <View style={{ backgroundColor: color, height: 2, width: size, marginTop: -size / 2 }} />
    </View>
);

const styles = StyleSheet.create({
    anchorVertical: {
        position: 'absolute',
    },
    anchorCross: {
        position: 'absolute',
    },
    anchorLeft: {
        position: 'absolute',
    },
    anchorRight: {
        position: 'absolute',
    },
    circle: {
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerHand: {
        position: 'absolute',
        borderRadius: 1,
    },
    battery: {
        borderRadius: 4,
        overflow: 'hidden',
    },
    batteryTip: {
        borderRadius: 2,
    },
    batteryFill: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    square: {
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        fontWeight: 'bold',
    },
    braindots: {
        position: 'absolute',
    },
    innerCircle: {},
});
