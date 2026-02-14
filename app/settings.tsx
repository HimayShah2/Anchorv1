import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';
import type { Settings } from '../store/useStore';

const TIMER_PRESETS = [15, 25, 45, 60];
const HAPTIC_OPTIONS: { label: string; value: Settings['hapticStrength'] }[] = [
    { label: 'Off', value: 'off' },
    { label: 'Light', value: 'light' },
    { label: 'Medium', value: 'medium' },
    { label: 'Heavy', value: 'heavy' },
];

export default function SettingsScreen() {
    const { settings, updateSettings, panic } = useStore();

    const confirmReset = () => {
        Alert.alert(
            '⚠️ Factory Reset',
            'This will clear ALL tasks, history, and settings. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset Everything', style: 'destructive', onPress: panic },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Settings',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                }}
            />
            <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>

                {/* Timer Duration */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Timer Duration</Text>
                <View className="flex-row gap-2 mb-6">
                    {TIMER_PRESETS.map(mins => (
                        <Pressable
                            key={mins}
                            onPress={() => updateSettings({ timerMinutes: mins })}
                            className={`flex-1 py-3 rounded-xl items-center ${settings.timerMinutes === mins ? 'bg-focus' : 'bg-surface border border-dim'}`}
                            accessibilityLabel={`Set timer to ${mins} minutes`}
                            accessibilityRole="button"
                            style={{ minHeight: 48 }}
                        >
                            <Text className={`font-bold ${settings.timerMinutes === mins ? 'text-black' : 'text-gray-400'}`}>
                                {mins}m
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Haptic Strength */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Haptic Feedback</Text>
                <View className="flex-row gap-2 mb-6">
                    {HAPTIC_OPTIONS.map(opt => (
                        <Pressable
                            key={opt.value}
                            onPress={() => updateSettings({ hapticStrength: opt.value })}
                            className={`flex-1 py-3 rounded-xl items-center ${settings.hapticStrength === opt.value ? 'bg-primary' : 'bg-surface border border-dim'}`}
                            accessibilityLabel={`Set haptic feedback to ${opt.label}`}
                            accessibilityRole="button"
                            style={{ minHeight: 48 }}
                        >
                            <Text className={`font-bold text-xs ${settings.hapticStrength === opt.value ? 'text-black' : 'text-gray-400'}`}>
                                {opt.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Notifications */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Notifications</Text>
                <Pressable
                    onPress={() => updateSettings({ notifyOnComplete: !settings.notifyOnComplete })}
                    className="bg-surface border border-dim rounded-xl p-4 flex-row justify-between items-center mb-6"
                    accessibilityLabel="Toggle timer completion notification"
                    accessibilityRole="switch"
                    style={{ minHeight: 48 }}
                >
                    <Text className="text-white font-bold">Timer Complete Alert</Text>
                    <View className={`w-12 h-7 rounded-full justify-center ${settings.notifyOnComplete ? 'bg-primary items-end' : 'bg-dim items-start'}`}>
                        <View className="w-5 h-5 bg-white rounded-full mx-1" />
                    </View>
                </Pressable>

                {/* Data Management */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Data</Text>
                <Pressable
                    onPress={() => useStore.getState().exportData()}
                    className="bg-surface border border-dim p-4 rounded-xl mb-2"
                    accessibilityLabel="Backup as JSON"
                    accessibilityRole="button"
                    style={{ minHeight: 48 }}
                >
                    <Text className="text-white font-bold text-center">💾 Backup JSON</Text>
                </Pressable>
                <Pressable
                    onPress={() => useStore.getState().exportCSV()}
                    className="bg-surface border border-dim p-4 rounded-xl mb-2"
                    accessibilityLabel="Export history as CSV"
                    accessibilityRole="button"
                    style={{ minHeight: 48 }}
                >
                    <Text className="text-white font-bold text-center">📄 Export CSV</Text>
                </Pressable>

                {/* Danger Zone */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2 mt-6">Danger Zone</Text>
                <Pressable
                    onPress={confirmReset}
                    className="bg-panic/10 border border-panic/30 p-4 rounded-xl mb-8"
                    accessibilityLabel="Factory reset - delete all data"
                    accessibilityRole="button"
                    style={{ minHeight: 48 }}
                >
                    <Text className="text-panic font-bold text-center">⚠️ Factory Reset</Text>
                    <Text className="text-panic/60 text-xs text-center mt-1">Deletes all tasks, history, and settings</Text>
                </Pressable>

                {/* App Info */}
                <View className="items-center py-4 mb-8">
                    <Text className="text-gray-600 text-xs">Anchor V4 — Ironclad Edition</Text>
                    <Text className="text-gray-700 text-[10px]">Built for minds that work differently</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
