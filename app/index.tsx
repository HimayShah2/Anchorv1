import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { VisualTimer } from '../components/VisualTimer';
import { VoiceInput } from '../components/VoiceInput';
import { EnergyTracker } from '../components/EnergyTracker';
import { TaskBreakdown } from '../components/TaskBreakdown';
import { format } from 'date-fns';

export default function Home() {
    const { stack, backlog, categories, addTask, completeTop, deferTop, promote, currentEnergy } = useStore();
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'NOW' | 'LATER'>('NOW');
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showEnergyTracker, setShowEnergyTracker] = useState(false);
    const [showTaskBreakdown, setShowTaskBreakdown] = useState(false);
    const [breakdownTaskText, setBreakdownTaskText] = useState('');
    const anchor = stack[0];
    // Swipe gesture for complete/defer
    const pan = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
            onPanResponderMove: (_, gesture) => {
                pan.setValue(gesture.dx);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > 100) {
                    // Swipe right = Complete
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    completeTop();
                } else if (gesture.dx < -100) {
                    // Swipe left = Defer  
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    deferTop();
                }
                Animated.spring(pan, { toValue: 0, useNativeDriver: true }).start();
            },
        })
    ).current;

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
        <SafeAreaView className="flex-1 px-5 py-5 justify-between" style={{ backgroundColor: '#0a0a0a' }}>
            {/* Header - Improved Spacing & Typography */}
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-text-tertiary text-xs font-semibold uppercase tracking-widest mb-1">Backlog</Text>
                    <Text className="text-white text-4xl font-bold tracking-tight">{backlog.length}</Text>
                </View>
                <View className="flex-row gap-2">
                    <Link href="/brain" asChild>
                        <Pressable
                            className="bg-elevated px-4 py-3 rounded-xl border border-dim active:bg-surface"
                            accessibilityLabel="View brain notes"
                            accessibilityRole="button"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-lg">🧠</Text>
                        </Pressable>
                    </Link>
                    <Link href="/history" asChild>
                        <Pressable
                            className="bg-elevated px-4 py-3 rounded-xl border border-dim active:bg-surface"
                            accessibilityLabel="View history"
                            accessibilityRole="button"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-lg">📜</Text>
                        </Pressable>
                    </Link>
                    <Link href="/backlog" asChild>
                        <Pressable
                            className="bg-elevated px-4 py-3 rounded-xl border border-dim active:bg-surface"
                            accessibilityLabel="View backlog"
                            accessibilityRole="button"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-lg">📋</Text>
                        </Pressable>
                    </Link>
                    <Link href="/analytics" asChild>
                        <Pressable
                            className="bg-elevated px-4 py-3 rounded-xl border border-dim active:bg-surface"
                            accessibilityLabel="View analytics"
                            accessibilityRole="button"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-lg">📊</Text>
                        </Pressable>
                    </Link>
                    <Link href="/settings" asChild>
                        <Pressable
                            className="bg-elevated px-4 py-3 rounded-xl border border-dim active:bg-surface"
                            accessibilityLabel="Settings"
                            accessibilityRole="button"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-lg">⚙️</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>

            {/* THE ANCHOR CARD - Improved Spacing & Shadows */}
            <View className="flex-1 justify-center py-6">
                {anchor ? (
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[{ transform: [{ translateX: pan }] }, { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }]}
                        className="bg-elevated p-7 rounded-3xl border border-dim"
                    >
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-primary text-xs font-bold uppercase tracking-wider">Current Focus</Text>
                            <Text className="text-text-tertiary text-xs font-medium">👈 Defer | Complete 👉</Text>
                        </View>
                        <Text
                            className="text-white text-3xl font-bold leading-snug mb-5 tracking-tight"
                            accessibilityRole="header"
                        >
                            {anchor.text}
                        </Text>

                        {/* Deadline Display - Better Typography */}
                        {anchor.deadline && (
                            <View className="flex-row items-center mb-4">
                                <Text className={`text-sm font-semibold ${anchor.deadline < Date.now() ? 'text-error' :
                                    anchor.deadline < Date.now() + 86400000 ? 'text-warning' :
                                        'text-text-secondary'
                                    }`}>
                                    ⏰ Due {format(anchor.deadline, 'MMM d, yyyy')}
                                </Text>
                            </View>
                        )}

                        {/* Category Chips */}
                        {anchor.categories.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {anchor.categories.map(catId => {
                                    const cat = categories.find(c => c.id === catId);
                                    return cat ? (
                                        <View
                                            key={cat.id}
                                            className="px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: cat.color + '33' }}
                                        >
                                            <Text className="text-sm font-bold" style={{ color: cat.color }}>
                                                {cat.icon} {cat.name}
                                            </Text>
                                        </View>
                                    ) : null;
                                })}
                            </View>
                        )}

                        <View className="flex-row gap-3 mt-2">
                            <Pressable
                                onPress={completeTop}
                                className="flex-1 bg-success h-14 rounded-2xl items-center justify-center active:bg-success/90"
                                accessibilityLabel="Mark task as done"
                                accessibilityRole="button"
                                style={{ minHeight: 56, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
                            >
                                <Text className="text-black font-bold text-base tracking-wide">COMPLETE ✓</Text>
                            </Pressable>
                            <Pressable
                                onPress={deferTop}
                                className="w-20 bg-dim h-14 rounded-2xl items-center justify-center active:bg-surface"
                                accessibilityLabel="Defer task to backlog"
                                accessibilityRole="button"
                                style={{ minHeight: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }}
                            >
                                <Text className="text-white font-semibold text-sm">Later</Text>
                            </Pressable>
                        </View>
                        <VisualTimer />

                        {/* Stack depth indicator */}
                        {stack.length > 1 && (
                            <Text className="text-gray-500 text-xs text-center mt-3">
                                +{stack.length - 1} more in stack
                            </Text>
                        )}
                    </Animated.View>
                ) : (
                    <View className="items-center">
                        <Text className="text-white text-xl font-bold mb-1">Ready to Anchor.</Text>
                        <Text className="text-gray-500 text-sm mb-6">Input a task to begin.</Text>
                        {/* Quick Backlog Preview */}
                        {backlog.length > 0 && (
                            <ScrollView className="max-h-48 w-full">
                                <Text className="text-gray-500 text-xs font-bold uppercase mb-2">From Backlog</Text>
                                {backlog.slice(-3).reverse().map(t => {
                                    const taskCategories = t.categories.map(catId => categories.find(c => c.id === catId)).filter(Boolean);
                                    const hasDeadline = t.deadline && t.deadline > Date.now();
                                    const isOverdue = t.deadline && t.deadline < Date.now();

                                    return (
                                        <Pressable
                                            key={t.id}
                                            onPress={() => promote(t.id)}
                                            className="bg-surface p-3 mb-2 rounded-xl border border-dim"
                                            accessibilityLabel={`Promote task: ${t.text}`}
                                            accessibilityRole="button"
                                            style={{ minHeight: 48 }}
                                        >
                                            <Text className="text-white text-sm mb-1">{t.text}</Text>

                                            {/* Metadata Row */}
                                            <View className="flex-row items-center gap-2 flex-wrap">
                                                {/* Deadline Badge */}
                                                {t.deadline && (
                                                    <View className={`px-2 py-0.5 rounded-full ${isOverdue ? 'bg-panic' : 'bg-focus/30'}`}>
                                                        <Text className={`text-[10px] font-bold ${isOverdue ? 'text-white' : 'text-focus'}`}>
                                                            ⏰ {format(t.deadline, 'MMM d')}
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Category Chips */}
                                                {taskCategories.slice(0, 2).map(cat => cat && (
                                                    <View
                                                        key={cat.id}
                                                        className="px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: cat.color + '33' }}
                                                    >
                                                        <Text className="text-[10px] font-bold" style={{ color: cat.color }}>
                                                            {cat.icon}
                                                        </Text>
                                                    </View>
                                                ))}
                                                {taskCategories.length > 2 && (
                                                    <Text className="text-gray-500 text-[10px]">+{taskCategories.length - 2}</Text>
                                                )}
                                            </View>
                                        </Pressable>
                                    );
                                })}
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

            {/* Energy Tracker Modal */}
            <EnergyTracker
                visible={showEnergyTracker}
                onClose={() => setShowEnergyTracker(false)}
                onSelect={(energy) => {
                    useStore.setState({ currentEnergy: energy });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                currentEnergy={currentEnergy}
            />

            {/* Task Breakdown Modal */}
            <TaskBreakdown
                visible={showTaskBreakdown}
                onClose={() => setShowTaskBreakdown(false)}
                taskText={breakdownTaskText}
                onBreakdown={(steps) => {
                    steps.forEach(step => addTask(step, false));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
            />
        </SafeAreaView>
    );
}
