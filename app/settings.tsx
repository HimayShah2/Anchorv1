import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
    const { theme, calendarSync } = settings;

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
                <View className="flex-row gap-2 mb-2">
                    {TIMER_PRESETS.map(mins => (
                        <Pressable
                            key={mins}
                            onPress={() => {
                                Haptics.selectionAsync();
                                updateSettings({ timerMinutes: mins });
                            }}
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

                {/* Custom Timer Input */}
                <View className="flex-row items-center gap-2 mb-6">
                    <Text className="text-gray-500 text-xs">Custom:</Text>
                    <TextInput
                        value={!TIMER_PRESETS.includes(settings.timerMinutes) ? String(settings.timerMinutes) : ''}
                        onChangeText={(text) => {
                            const mins = parseInt(text);
                            if (!isNaN(mins) && mins > 0 && mins <= 180) {
                                updateSettings({ timerMinutes: mins });
                            }
                        }}
                        placeholder="min"
                        placeholderTextColor="#52525b"
                        keyboardType="number-pad"
                        className="bg-surface border border-dim rounded-xl px-3 py-2 text-white flex-1"
                        maxLength={3}
                    />
                    <Text className="text-gray-500 text-xs">minutes</Text>
                </View>

                {/* Haptic Strength */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Haptic Feedback</Text>
                <View className="flex-row gap-2 mb-6">
                    {HAPTIC_OPTIONS.map(opt => (
                        <Pressable
                            key={opt.value}
                            onPress={() => {
                                Haptics.selectionAsync();
                                updateSettings({ hapticStrength: opt.value });
                            }}
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

                {/* Appearance */}
                <Text className="text-white text-xl font-bold mb-4 mt-6">Appearance</Text>

                {/* Manage Categories */}
                <Link href="/categories" asChild>
                    <Pressable
                        className="bg-surface p-4 rounded-2xl border border-dim mb-3"
                        accessibilityLabel="Manage categories"
                        accessibilityRole="button"
                    >
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-white text-base font-bold">🏷️ Manage Categories</Text>
                                <Text className="text-gray-500 text-xs">Organize tasks, notes & journals</Text>
                            </View>
                            <Text className="text-gray-600">→</Text>
                        </View>
                    </Pressable>
                </Link>

                {/* Theme */}
                <View className="bg-surface p-4 rounded-2xl border border-dim mb-3">
                    <Text className="text-white text-base font-bold mb-3">Theme</Text>
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => updateSettings({ theme: 'dark' })}
                            className={`flex-1 py-3 rounded-xl ${theme === 'dark' ? 'bg-primary' : 'bg-dim'}`}
                            accessibilityLabel="Dark theme"
                            accessibilityRole="button"
                        >
                            <Text className={`text-center font-bold ${theme === 'dark' ? 'text-black' : 'text-gray-400'}`}>
                                🌙 Dark
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => updateSettings({ theme: 'light' })}
                            className={`flex-1 py-3 rounded-xl ${theme === 'light' ? 'bg-yellow-400' : 'bg-dim'}`}
                            accessibilityLabel="Light theme"
                            accessibilityRole="button"
                        >
                            <Text className={`text-center font-bold ${theme === 'light' ? 'text-black' : 'text-gray-400'}`}>
                                ☀️ Light
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Calendar Sync */}
                <View className="bg-surface p-4 rounded-2xl border border-dim mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1">
                            <Text className="text-white text-base font-bold">📅 Calendar Sync</Text>
                            <Text className="text-gray-500 text-xs">Sync deadlines to device calendar</Text>
                        </View>
                        <Pressable
                            onPress={async () => {
                                if (!calendarSync) {
                                    // Request permissions
                                    const { requestCalendarPermissions } = await import('../utils/calendarSync');
                                    const granted = await requestCalendarPermissions();
                                    if (granted) {
                                        updateSettings({ calendarSync: true });
                                    } else {
                                        Alert.alert(
                                            'Permission Denied',
                                            'Calendar access is required to sync tasks. Please enable in Settings.'
                                        );
                                    }
                                } else {
                                    updateSettings({ calendarSync: false });
                                }
                            }}
                            className={`w-12 h-6 rounded-full ${calendarSync ? 'bg-primary' : 'bg-dim'} flex-row items-center p-1`}
                        >
                            <View
                                className={`w-4 h-4 rounded-full bg-white ${calendarSync ? 'ml-auto' : ''}`}
                            />
                        </Pressable>
                    </View>
                    {calendarSync && (
                        <Text className="text-gray-500 text-xs">
                            ✓ Tasks with deadlines will appear in your calendar
                        </Text>
                    )}
                </View>

                {/* Do Not Disturb */}
                <View className="bg-surface p-4 rounded-2xl border border-dim mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-1">
                            <Text className="text-white text-base font-bold">📵 Auto Do Not Disturb</Text>
                            <Text className="text-gray-500 text-xs">Silence notifications during tasks</Text>
                        </View>
                        <Pressable
                            onPress={async () => {
                                const autoDND = settings.autoDND || false;
                                if (!autoDND) {
                                    // Request permissions
                                    const { requestDNDPermissions } = await import('../utils/dndManager');
                                    const granted = await requestDNDPermissions();
                                    if (granted) {
                                        updateSettings({ autoDND: true });
                                    }
                                } else {
                                    updateSettings({ autoDND: false });
                                }
                            }}
                            className={`w-12 h-6 rounded-full ${settings.autoDND ? 'bg-primary' : 'bg-dim'} flex-row items-center p-1`}
                        >
                            <View
                                className={`w-4 h-4 rounded-full bg-white ${settings.autoDND ? 'ml-auto' : ''}`}
                            />
                        </Pressable>
                    </View>
                    {settings.autoDND && (
                        <Text className="text-gray-500 text-xs">
                            ✓ Phone will enter silent mode when you start a task
                        </Text>
                    )}
                </View>

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
                <Pressable
                    onPress={() => useStore.getState().exportMarkdown()}
                    className="bg-primary/20 border border-primary p-4 rounded-xl mb-2"
                    accessibilityLabel="Export as Obsidian Markdown"
                    accessibilityRole="button"
                    style={{ minHeight: 48 }}
                >
                    <Text className="text-primary font-bold text-center">📝 Export Markdown (Obsidian)</Text>
                    <Text className="text-primary/70 text-xs text-center mt-1">Daily notes with tags & journal entries</Text>
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
