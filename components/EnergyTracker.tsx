import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

interface EnergyTrackerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (energy: number) => void;
    currentEnergy: number;
}

export const EnergyTracker = ({ visible, onClose, onSelect, currentEnergy }: EnergyTrackerProps) => {
    const [selectedEnergy, setSelectedEnergy] = useState(currentEnergy || 3);

    const energyLevels = [
        { value: 1, emoji: '🪫', label: 'Drained', color: '#ef4444' },
        { value: 2, emoji: '⚡', label: 'Low', color: '#f97316' },
        { value: 3, emoji: '🔋', label: 'Medium', color: '#eab308' },
        { value: 4, emoji: '✨', label: 'Good', color: '#22c55e' },
        { value: 5, emoji: '🚀', label: 'High', color: '#10b981' },
    ];

    const handleSelect = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSelect(selectedEnergy);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/80 justify-center px-6">
                <View className="bg-surface p-6 rounded-3xl border border-dim">
                    <Text className="text-white text-2xl font-bold mb-2">Energy Level</Text>
                    <Text className="text-gray-400 text-sm mb-6">
                        How much energy do you have right now?
                    </Text>

                    <View className="gap-3 mb-6">
                        {energyLevels.map((level) => (
                            <Pressable
                                key={level.value}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setSelectedEnergy(level.value);
                                }}
                                className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${selectedEnergy === level.value ? 'border-primary' : 'border-dim'
                                    }`}
                                style={{
                                    backgroundColor: selectedEnergy === level.value ? level.color + '20' : '#18181b',
                                }}
                            >
                                <View className="flex-row items-center gap-3">
                                    <Text className="text-3xl">{level.emoji}</Text>
                                    <View>
                                        <Text className="text-white font-bold text-lg">{level.label}</Text>
                                        <Text className="text-gray-500 text-sm">{level.value}/5 spoons</Text>
                                    </View>
                                </View>
                                {selectedEnergy === level.value && (
                                    <Text className="text-2xl">✓</Text>
                                )}
                            </Pressable>
                        ))}
                    </View>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 bg-dim py-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSelect}
                            className="flex-1 bg-primary py-4 rounded-xl items-center"
                        >
                            <Text className="text-black font-bold">Set Energy</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
