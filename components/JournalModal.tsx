import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { useStore } from '../store/useStore';

const ENERGY_EMOJIS = ['😴', '😕', '😐', '😊', '🔥'];
const FOCUS_EMOJIS = ['🌫️', '😶', '🤔', '🎯', '💎'];

export const JournalModal = () => {
    const pendingId = useStore(s => s.pendingJournalTaskId);
    const history = useStore(s => s.history);
    const logJournal = useStore(s => s.logJournal);
    const dismissJournal = useStore(s => s.dismissJournal);

    const [energy, setEnergy] = useState(3);
    const [focus, setFocus] = useState(3);
    const [note, setNote] = useState('');

    const task = history.find(t => t.id === pendingId);
    if (!pendingId || !task) return null;

    const submit = () => {
        logJournal(pendingId, { energy, focus, note });
        setEnergy(3);
        setFocus(3);
        setNote('');
    };

    const skip = () => {
        dismissJournal();
        setEnergy(3);
        setFocus(3);
        setNote('');
    };

    return (
        <Modal visible transparent animationType="slide">
            <View className="flex-1 justify-end">
                <View className="bg-surface mx-4 mb-8 rounded-3xl p-6 border border-dim">
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Task Completed</Text>
                    <Text className="text-white text-lg font-bold mb-6" numberOfLines={2}>{task.text}</Text>

                    {/* Energy */}
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Energy Level</Text>
                    <View className="flex-row justify-between mb-5">
                        {ENERGY_EMOJIS.map((emoji, i) => (
                            <Pressable
                                key={i}
                                onPress={() => setEnergy(i + 1)}
                                className={`w-12 h-12 rounded-xl items-center justify-center ${energy === i + 1 ? 'bg-primary/20 border border-primary' : 'bg-dim'}`}
                                accessibilityLabel={`Energy level ${i + 1}`}
                                accessibilityRole="button"
                            >
                                <Text className="text-xl">{emoji}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Focus */}
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Focus Quality</Text>
                    <View className="flex-row justify-between mb-5">
                        {FOCUS_EMOJIS.map((emoji, i) => (
                            <Pressable
                                key={i}
                                onPress={() => setFocus(i + 1)}
                                className={`w-12 h-12 rounded-xl items-center justify-center ${focus === i + 1 ? 'bg-focus/20 border border-focus' : 'bg-dim'}`}
                                accessibilityLabel={`Focus quality ${i + 1}`}
                                accessibilityRole="button"
                            >
                                <Text className="text-xl">{emoji}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Note */}
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Quick reflection... (optional)"
                        placeholderTextColor="#52525b"
                        className="bg-bg border border-dim rounded-xl px-4 py-3 text-white text-sm mb-6"
                        multiline
                        accessibilityLabel="Reflection note"
                    />

                    {/* Actions */}
                    <View className="flex-row gap-3">
                        <Pressable
                            onPress={submit}
                            className="flex-1 bg-primary h-12 rounded-xl items-center justify-center"
                            accessibilityLabel="Save journal entry"
                            accessibilityRole="button"
                        >
                            <Text className="text-black font-bold">Log & Continue</Text>
                        </Pressable>
                        <Pressable
                            onPress={skip}
                            className="w-20 bg-dim h-12 rounded-xl items-center justify-center"
                            accessibilityLabel="Skip journaling"
                            accessibilityRole="button"
                        >
                            <Text className="text-gray-400 font-bold text-sm">Skip</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
