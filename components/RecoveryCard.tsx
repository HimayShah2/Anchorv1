import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

interface RecoveryCardProps {
    currentEnergy: number;
    onActivitySelect: (activity: string) => void;
}

const RECOVERY_ACTIVITIES = {
    1: [
        { emoji: '🛌', title: 'Rest/Nap', duration: '20-30 min' },
        { emoji: '🎵', title: 'Gentle Music', duration: '10 min' },
        { emoji: '🌿', title: 'Just Breathe', duration: '5 min' },
    ],
    2: [
        { emoji: '💧', title: 'Drink Water', duration: '2 min' },
        { emoji: '🍎', title: 'Healthy Snack', duration: '5 min' },
        { emoji: '🧘', title: 'Light Stretch', duration: '5 min' },
    ],
};

export const RecoveryCard = ({ currentEnergy, onActivitySelect }: RecoveryCardProps) => {
    if (currentEnergy >= 3) return null; // Only show when low energy

    const activities = RECOVERY_ACTIVITIES[currentEnergy as 1 | 2] || [];

    return (
        <View className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/30 mb-4">
            <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-2">🥄</Text>
                <Text className="text-white font-bold text-lg">Spoon Recovery</Text>
            </View>

            <Text className="text-gray-400 text-sm mb-4">
                You're running low on energy. Try one of these gentle activities:
            </Text>

            <View className="gap-2">
                {activities.map((activity, index) => (
                    <Pressable
                        key={index}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onActivitySelect(activity.title);
                        }}
                        className="bg-purple-500/20 p-3 rounded-xl flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center gap-2">
                            <Text className="text-2xl">{activity.emoji}</Text>
                            <View>
                                <Text className="text-white font-bold">{activity.title}</Text>
                                <Text className="text-gray-500 text-xs">{activity.duration}</Text>
                            </View>
                        </View>
                        <Text className="text-purple-400">→</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};
