import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TaskBreakdownProps {
    visible: boolean;
    onClose: () => void;
    taskText: string;
    onBreakdown: (steps: string[]) => void;
}

export const TaskBreakdown = ({ visible, onClose, taskText, onBreakdown }: TaskBreakdownProps) => {
    const [steps, setSteps] = useState<string[]>(['', '', '']);
    const [showSuggested, setShowSuggested] = useState(true);

    // Auto-suggest micro-steps based on task
    const suggestedSteps = [
        `Start: ${taskText.slice(0, 30)}...`,
        `Work on main part`,
        `Finish & review`,
    ];

    const handleAddStep = () => {
        Haptics.selectionAsync();
        setSteps([...steps, '']);
    };

    const handleUpdateStep = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };

    const handleUseSuggested = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSteps(suggestedSteps);
        setShowSuggested(false);
    };

    const handleConfirm = () => {
        const validSteps = steps.filter(s => s.trim().length > 0);
        if (validSteps.length > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onBreakdown(validSteps);
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-surface p-6 rounded-t-3xl border-t border-dim max-h-[80%]">
                    <Text className="text-white text-2xl font-bold mb-2">Break It Down</Text>
                    <Text className="text-gray-400 text-sm mb-4">
                        Split "{taskText}" into smaller steps
                    </Text>

                    {showSuggested && (
                        <Pressable
                            onPress={handleUseSuggested}
                            className="bg-primary/20 border border-primary p-4 rounded-xl mb-4"
                        >
                            <Text className="text-primary font-bold mb-2">💡 Suggested Steps</Text>
                            {suggestedSteps.map((step, i) => (
                                <Text key={i} className="text-white text-sm">• {step}</Text>
                            ))}
                            <Text className="text-primary text-xs mt-2">Tap to use these</Text>
                        </Pressable>
                    )}

                    <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
                        {steps.map((step, index) => (
                            <View key={index} className="flex-row items-center mb-3">
                                <Text className="text-gray-500 mr-3">{index + 1}.</Text>
                                <TextInput
                                    value={step}
                                    onChangeText={(text) => handleUpdateStep(index, text)}
                                    placeholder="Enter micro-step..."
                                    placeholderTextColor="#6b7280"
                                    className="flex-1 bg-dim text-white p-4 rounded-xl"
                                />
                            </View>
                        ))}

                        <Pressable
                            onPress={handleAddStep}
                            className="border border-dashed border-dim p-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-500">+ Add Step</Text>
                        </Pressable>
                    </ScrollView>

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={onClose}
                            className="flex-1 bg-dim py-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleConfirm}
                            className="flex-1 bg-primary py-4 rounded-xl items-center"
                        >
                            <Text className="text-black font-bold">Create Steps</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
