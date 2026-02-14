import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import { VisualTimer } from '../components/VisualTimer';
import { VoiceInput } from '../components/VoiceInput';
import { format } from 'date-fns';

export default function Home() {
    const { stack, backlog, categories, addTask, completeTop, deferTop, promote } = useStore();
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'NOW' | 'LATER'>('NOW');
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const anchor = stack[0];

    const submit = () => {
        if (!text.trim()) return;
        addTask(text, mode === 'NOW', deadline?.getTime(), selectedCategories);
        setText('');
        setDeadline(undefined);
        setSelectedCategories([]);
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const getCategoryById = (id: string) => categories.find(c => c.id === id);

    return (
        <SafeAreaView className="flex-1 px-6 py-4 justify-between">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Backlog</Text>
                    <Text className="text-white text-3xl font-bold">{backlog.length}</Text>
                </View>
                <View className="flex-row gap-2">
                    <Link href="/brain" asChild>
                        <Pressable
                            className="bg-surface px-3 py-2 rounded-full border border-dim"
                            accessibilityLabel="View brain notes"
                            accessibilityRole="button"
                        >
                            <Text className="text-primary font-bold text-xs">🧠</Text>
                        </Pressable>
                    </Link>
                    <Link href="/history" asChild>
                        <Pressable
                            className="bg-surface px-3 py-2 rounded-full border border-dim"
                            accessibilityLabel="View history"
                            accessibilityRole="button"
                        >
                            <Text className="text-primary font-bold text-xs">📜</Text>
                        </Pressable>
                    </Link>
                    <Link href="/backlog" asChild>
                        <Pressable
                            className="bg-surface px-3 py-2 rounded-full border border-dim"
                            accessibilityLabel="View backlog"
                            accessibilityRole="button"
                        >
                            <Text className="text-accent font-bold text-xs">📋</Text>
                        </Pressable>
                    </Link>
                    <Link href="/analytics" asChild>
                        <Pressable
                            className="bg-surface px-3 py-2 rounded-full border border-dim"
                            accessibilityLabel="View analytics"
                            accessibilityRole="button"
                        >
                            <Text className="text-focus font-bold text-xs">📊</Text>
                        </Pressable>
                    </Link>
                    <Link href="/settings" asChild>
                        <Pressable
                            className="bg-surface px-3 py-2 rounded-full border border-dim"
                            accessibilityLabel="Settings"
                            accessibilityRole="button"
                        >
                            <Text className="text-gray-400 font-bold text-xs">⚙️</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>

            {/* THE ANCHOR CARD */}
            <View className="flex-1 justify-center py-8">
                {anchor ? (
                    <View className="bg-surface p-6 rounded-3xl border border-dim">
                        <Text className="text-focus text-xs font-bold uppercase mb-4">Current Focus</Text>
                        <Text
                            className="text-white text-3xl font-bold leading-tight mb-8"
                            accessibilityRole="header"
                        >
                            {anchor.text}
                        </Text>

                        <View className="flex-row gap-4">
                            <Pressable
                                onPress={completeTop}
                                className="flex-1 bg-primary h-14 rounded-xl items-center justify-center"
                                accessibilityLabel="Mark task as done"
                                accessibilityRole="button"
                                style={{ minHeight: 48 }}
                            >
                                <Text className="text-black font-bold text-lg">DONE ✓</Text>
                            </Pressable>
                            <Pressable
                                onPress={deferTop}
                                className="w-16 bg-dim h-14 rounded-xl items-center justify-center"
                                accessibilityLabel="Defer task to backlog"
                                accessibilityRole="button"
                                style={{ minHeight: 48 }}
                            >
                                <Text className="text-white font-bold">Later</Text>
                            </Pressable>
                        </View>
                        <VisualTimer />

                        {/* Stack depth indicator */}
                        {stack.length > 1 && (
                            <Text className="text-gray-500 text-xs text-center mt-3">
                                +{stack.length - 1} more in stack
                            </Text>
                        )}
                    </View>
                ) : (
                    <View className="items-center">
                        <Text className="text-white text-xl font-bold mb-1">Ready to Anchor.</Text>
                        <Text className="text-gray-500 text-sm mb-6">Input a task to begin.</Text>
                        {/* Quick Backlog Preview */}
                        {backlog.length > 0 && (
                            <ScrollView className="max-h-48 w-full">
                                <Text className="text-gray-500 text-xs font-bold uppercase mb-2">From Backlog</Text>
                                {backlog.slice(-3).reverse().map(t => (
                                    <Pressable
                                        key={t.id}
                                        onPress={() => promote(t.id)}
                                        className="bg-surface p-4 mb-2 rounded-xl border border-dim"
                                        accessibilityLabel={`Promote task: ${t.text}`}
                                        accessibilityRole="button"
                                        style={{ minHeight: 48 }}
                                    >
                                        <Text className="text-gray-300">{t.text}</Text>
                                        <Text className="text-gray-600 text-[10px] mt-1">Tap to promote</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}
            </View>

            {/* INPUT AREA */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="flex-row gap-2 mb-2">
                    <Pressable
                        onPress={() => setMode('NOW')}
                        className={`px-4 py-2 rounded-full ${mode === 'NOW' ? 'bg-focus' : 'bg-surface'}`}
                        accessibilityLabel="Set mode to Do Now"
                        accessibilityRole="button"
                        style={{ minHeight: 40 }}
                    >
                        <Text className={`font-bold text-xs ${mode === 'NOW' ? 'text-black' : 'text-gray-500'}`}>DO NOW</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setMode('LATER')}
                        className={`px-4 py-2 rounded-full ${mode === 'LATER' ? 'bg-dim' : 'bg-surface'}`}
                        accessibilityLabel="Set mode to Later"
                        accessibilityRole="button"
                        style={{ minHeight: 40 }}
                    >
                        <Text className={`font-bold text-xs ${mode === 'LATER' ? 'text-white' : 'text-gray-500'}`}>LATER</Text>
                    </Pressable>

                    {/* Deadline Button */}
                    <Pressable
                        onPress={() => setShowDatePicker(true)}
                        className={`px-3 py-2 rounded-full ${deadline ? 'bg-panic' : 'bg-surface border border-dim'}`}
                        accessibilityLabel="Set deadline"
                        accessibilityRole="button"
                        style={{ minHeight: 40 }}
                    >
                        <Text className={`font-bold text-xs ${deadline ? 'text-white' : 'text-gray-500'}`}>
                            {deadline ? '⏰ ' + format(deadline, 'MMM d') : '📅'}
                        </Text>
                    </Pressable>

                    {deadline && (
                        <Pressable
                            onPress={() => setDeadline(undefined)}
                            className="px-2 py-2 rounded-full bg-dim"
                            accessibilityLabel="Clear deadline"
                            accessibilityRole="button"
                        >
                            <Text className="text-gray-400 text-xs">✕</Text>
                        </Pressable>
                    )}
                </View>

                {/* Category Chips */}
                {categories.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-2"
                    >
                        <View className="flex-row gap-2">
                            {categories.map(cat => {
                                const isSelected = selectedCategories.includes(cat.id);
                                return (
                                    <Pressable
                                        key={cat.id}
                                        onPress={() => toggleCategory(cat.id)}
                                        className="px-3 py-1.5 rounded-full"
                                        style={{
                                            backgroundColor: isSelected ? cat.color : cat.color + '22',
                                            borderWidth: 1,
                                            borderColor: cat.color,
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-bold"
                                            style={{ color: isSelected ? '#000' : cat.color }}
                                        >
                                            {cat.icon} {cat.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}

                <View className="bg-surface rounded-2xl p-2 flex-row items-center border border-dim">
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        onSubmitEditing={submit}
                        className="flex-1 h-14 px-4 text-white text-lg"
                        placeholder={mode === 'NOW' ? "What's the next step?" : 'Brain dump...'}
                        placeholderTextColor="#52525b"
                        accessibilityLabel="Task input"
                    />
                    <VoiceInput onResult={(t) => setText(prev => prev ? prev + ' ' + t : t)} />
                    <Pressable
                        onPress={submit}
                        className="bg-dim w-10 h-10 rounded-xl items-center justify-center ml-1"
                        accessibilityLabel="Submit task"
                        accessibilityRole="button"
                    >
                        <Text className="text-white font-bold">↑</Text>
                    </Pressable>
                </View>

                {/* DateTimePicker Modal */}
                {showDatePicker && (
                    <DateTimePicker
                        value={deadline || new Date()}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setDeadline(selectedDate);
                            }
                        }}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
