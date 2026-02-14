import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput } from 'react-native';

interface TaskBreakdownProps {
    visible: boolean;
    onClose: () => void;
    taskText: string;
    onBreakdown: (steps: string[]) => void;
}

export const TaskBreakdown = ({ visible, onClose, taskText, onBreakdown }: TaskBreakdownProps) => {
    const [steps, setSteps] = useState<string[]>(['', '', '']);

    const handleAddStep = () => {
        setSteps([...steps, '']);
    };

    const handleUpdateStep = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };

    const handleConfirm = () => {
        const validSteps = steps.filter(s => s.trim().length > 0);
        if (validSteps.length > 0) {
            onBreakdown(validSteps);
            onClose();
            setSteps(['', '', '']);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-zinc-900 p-6 rounded-t-3xl border-t border-zinc-800 max-h-[80%]">
                    <Text className="text-white text-2xl font-bold mb-2">Break It Down</Text>
                    <Text className="text-gray-400 text-sm mb-4">Split into smaller steps</Text>

                    <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
                        {steps.map((step, index) => (
                            <View key={index} className="flex-row items-center mb-3">
                                <Text className="text-gray-500 mr-3">{index + 1}.</Text>
                                <TextInput
                                    value={step}
                                    onChangeText={(text) => handleUpdateStep(index, text)}
                                    placeholder="Enter micro-step..."
                                    placeholderTextColor="#6b7280"
                                    className="flex-1 bg-zinc-800 text-white p-4 rounded-xl"
                                />
                            </View>
                        ))}

                        <Pressable
                            onPress={handleAddStep}
                            className="border border-dashed border-zinc-700 p-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-500">+ Add Step</Text>
                        </Pressable>
                    </ScrollView>

                    <View className="flex-row gap-3">
                        <Pressable onPress={onClose} className="flex-1 bg-zinc-800 py-4 rounded-xl items-center">
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleConfirm} className="flex-1 bg-sky-400 py-4 rounded-xl items-center">
                            <Text className="text-black font-bold">Create Steps</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
