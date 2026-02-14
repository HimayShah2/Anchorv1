import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, ScrollView } from 'react-native';
import { useStore } from '../store/useStore';
import { MOOD_TAGS } from '../constants/journalPrompts';

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
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

    const task = history.find(t => t.id === pendingId);
    if (!pendingId || !task) return null;

    const toggleMood = (moodId: string) => {
        setSelectedMoods(prev =>
            prev.includes(moodId)
                ? prev.filter(id => id !== moodId)
                : [...prev, moodId]
        );
    };

    const submit = () => {
        logJournal(pendingId, {
            energy,
            focus,
            note,
            mood: selectedMoods,
        });
        setEnergy(3);
        setFocus(3);
        setNote('');
        setSelectedMoods([]);
    };

    const skip = () => {
        dismissJournal();
        setEnergy(3);
        setFocus(3);
        setNote('');
        setSelectedMoods([]);
    };

    return (
        <Modal visible transparent animationType="slide">
            <View className="flex-1 justify-end">
                <Pressable onPress={skip} className="flex-1 bg-black/50" />
                <View className="bg-surface mx-4 mb-8 rounded-3xl p-6 border border-dim max-h-[80%]">
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Task Completed</Text>
                    <Text className="text-white text-lg font-bold mb-4" numberOfLines={2}>{task.text}</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Energy */}
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Energy Level</Text>
                        <View className="flex-row justify-between mb-4">
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
                        <View className="flex-row justify-between mb-4">
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

                        {/* Mood Tags */}
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">How did it feel?</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {MOOD_TAGS.slice(0, 6).map(mood => {
                                const isSelected = selectedMoods.includes(mood.id);
                                return (
                                    <Pressable
                                        key={mood.id}
                                        onPress={() => toggleMood(mood.id)}
                                        className="px-3 py-1.5 rounded-full"
                                        style={{
                                            backgroundColor: isSelected ? mood.color : mood.color + '22',
                                            borderWidth: 1,
                                            borderColor: mood.color,
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-bold"
                                            style={{ color: isSelected ? '#000' : mood.color }}
                                        >
                                            {mood.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Note */}
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Quick reflection... (optional)"
                            placeholderTextColor="#52525b"
                            className="bg-bg border border-dim rounded-xl px-4 py-3 text-white text-sm mb-4"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            accessibilityLabel="Journal notes"
                        />

                        {/* Buttons */}
                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={skip}
                                className="flex-1 bg-dim py-3 rounded-xl"
                                accessibilityLabel="Skip journaling"
                                accessibilityRole="button"
                            >
                                <Text className="text-white text-center font-bold">Skip</Text>
                            </Pressable>
                            <Pressable
                                onPress={submit}
                                className="flex-1 bg-primary py-3 rounded-xl"
                                accessibilityLabel="Save journal entry"
                                accessibilityRole="button"
                            >
                                <Text className="text-black text-center font-bold">Save</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
