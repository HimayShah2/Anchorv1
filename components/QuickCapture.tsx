import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';

interface QuickCaptureProps {
    visible: boolean;
    onClose: () => void;
}

export const QuickCapture = ({ visible, onClose }: QuickCaptureProps) => {
    const { addNote } = useStore();
    const [thought, setThought] = useState('');

    const handleSave = () => {
        if (thought.trim()) {
            addNote({
                id: Date.now().toString(),
                created: Date.now(),
                title: '💭 Quick Thought',
                content: thought.trim(),
                tags: ['quick-capture'],
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setThought('');
            onClose();
        }
    };

    const handleCancel = () => {
        setThought('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-zinc-900 p-6 rounded-t-3xl border-t border-zinc-800">
                    <Text className="text-white text-2xl font-bold mb-2">💭 Quick Capture</Text>
                    <Text className="text-gray-400 text-sm mb-4">
                        Capture fleeting thoughts without losing focus
                    </Text>

                    <TextInput
                        value={thought}
                        onChangeText={setThought}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#6b7280"
                        className="bg-zinc-800 text-white p-4 rounded-xl mb-4 min-h-[120px]"
                        multiline
                        numberOfLines={5}
                        autoFocus
                        textAlignVertical="top"
                    />

                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={handleCancel}
                            className="flex-1 bg-zinc-800 py-4 rounded-xl items-center"
                        >
                            <Text className="text-gray-400 font-bold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSave}
                            className="flex-1 bg-sky-400 py-4 rounded-xl items-center"
                            disabled={!thought.trim()}
                        >
                            <Text className={`font-bold ${thought.trim() ? 'text-black' : 'text-gray-600'}`}>
                                Save to Brain
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
