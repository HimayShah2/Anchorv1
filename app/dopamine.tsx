import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';

interface DopamineActivity {
    id: string;
    title: string;
    emoji: string;
    duration: string; // "2 min", "5 min", etc
    energy: number; // Required energy level (1-5)
}

const DEFAULT_ACTIVITIES: DopamineActivity[] = [
    { id: '1', title: 'Stretch Break', emoji: '🧘', duration: '2 min', energy: 1 },
    { id: '2', title: 'Get Water', emoji: '💧', duration: '1 min', energy: 1 },
    { id: '3', title: 'Deep Breathing', emoji: '🌊', duration: '3 min', energy: 1 },
    { id: '4', title: 'Walk Around', emoji: '🚶', duration: '5 min', energy: 2 },
    { id: '5', title: 'Listen to Music', emoji: '🎵', duration: '5 min', energy: 1 },
    { id: '6', title: 'Snack Break', emoji: '🍎', duration: '5 min', energy: 1 },
    { id: '7', title: 'Quick Game', emoji: '🎮', duration: '10 min', energy: 2 },
    { id: '8', title: 'Social Media', emoji: '📱', duration: '5 min', energy: 2 },
    { id: '9', title: 'Doodle/Draw', emoji: '✏️', duration: '10 min', energy: 2 },
    { id: '10', title: 'Call Friend', emoji: '📞', duration: '15 min', energy: 3 },
];

export default function DopamineMenu() {
    const { currentEnergy } = useStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleActivityTap = (activity: DopamineActivity) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedId(activity.id);

        // Visual feedback - activity was selected
        setTimeout(() => setSelectedId(null), 1000);
    };

    // Filter activities by current energy level
    const availableActivities = DEFAULT_ACTIVITIES.filter(a => a.energy <= currentEnergy);
    const lockedActivities = DEFAULT_ACTIVITIES.filter(a => a.energy > currentEnergy);

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Dopamine Menu',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-white text-2xl font-bold mb-2">Quick Boost Activities</Text>
                    <Text className="text-gray-500 text-sm">
                        Based on your current energy: {currentEnergy}/5 {currentEnergy === 1 ? '🪫' : currentEnergy === 2 ? '⚡' : currentEnergy === 3 ? '🔋' : currentEnergy === 4 ? '✨' : '🚀'}
                    </Text>
                </View>

                {/* Available Activities */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-3">Available Now</Text>
                <View className="gap-3 mb-6">
                    {availableActivities.map((activity) => (
                        <Pressable
                            key={activity.id}
                            onPress={() => handleActivityTap(activity)}
                            className={`bg-surface p-4 rounded-2xl border-2 ${selectedId === activity.id ? 'border-sky-400' : 'border-dim'
                                }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3 flex-1">
                                    <Text className="text-4xl">{activity.emoji}</Text>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-lg">{activity.title}</Text>
                                        <Text className="text-gray-500 text-sm">{activity.duration}</Text>
                                    </View>
                                </View>
                                {selectedId === activity.id && (
                                    <View className="bg-sky-400 rounded-full w-8 h-8 items-center justify-center">
                                        <Text className="text-black font-bold">✓</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Locked Activities */}
                {lockedActivities.length > 0 && (
                    <>
                        <Text className="text-gray-500 font-bold uppercase text-xs mb-3">Needs More Energy</Text>
                        <View className="gap-3 mb-6">
                            {lockedActivities.map((activity) => (
                                <View
                                    key={activity.id}
                                    className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 opacity-50"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <Text className="text-4xl opacity-40">{activity.emoji}</Text>
                                            <View className="flex-1">
                                                <Text className="text-gray-600 font-bold text-lg">{activity.title}</Text>
                                                <Text className="text-gray-700 text-sm">
                                                    Requires {activity.energy}/5 energy
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="bg-zinc-800 rounded-full w-8 h-8 items-center justify-center">
                                            <Text className="text-gray-700">🔒</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                <View className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6">
                    <Text className="text-white font-bold text-base mb-2">💡 How It Works</Text>
                    <Text className="text-gray-500 text-sm leading-relaxed">
                        Choose a quick dopamine boost when you need motivation between tasks.
                        Activities are filtered by your current energy level for realistic suggestions.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
