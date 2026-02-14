import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';
import { subDays, startOfDay, format } from 'date-fns';
import TaskEditModal from '../components/TaskEditModal';
import type { Task } from '../store/useStore';

type Period = 7 | 30 | 'all';

export default function History() {
    const { history, categories } = useStore();
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState<Period>(7);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Filter by period and search
    const filtered = useMemo(() => {
        let tasks = [...history].reverse(); // Most recent first

        // Date filter
        if (period !== 'all') {
            const cutoff = subDays(new Date(), period).getTime();
            tasks = tasks.filter(t => t.completedAt && t.completedAt >= cutoff);
        }

        // Search filter
        if (search.trim()) {
            const query = search.toLowerCase();
            tasks = tasks.filter(t =>
                t.text.toLowerCase().includes(query) ||
                t.journal?.note?.toLowerCase().includes(query)
            );
        }

        return tasks;
    }, [history, period, search]);

    // Group by date
    const groupedByDate = useMemo(() => {
        const groups = new Map<string, typeof filtered>();
        filtered.forEach(task => {
            if (task.completedAt) {
                const dateKey = format(startOfDay(new Date(task.completedAt)), 'yyyy-MM-dd');
                if (!groups.has(dateKey)) {
                    groups.set(dateKey, []);
                }
                groups.get(dateKey)!.push(task);
            }
        });
        return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    }, [filtered]);

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'History',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                }}
            />

            {/* Period Toggle */}
            <View className="flex-row gap-2 mb-3 mt-2">
                <Pressable
                    onPress={() => setPeriod(7)}
                    className={`px-4 py-2 rounded-full ${period === 7 ? 'bg-focus' : 'bg-surface'}`}
                    accessibilityLabel="Show 7 days"
                    accessibilityRole="button"
                >
                    <Text className={`font-bold text-xs ${period === 7 ? 'text-black' : 'text-gray-500'}`}>7 Days</Text>
                </Pressable>
                <Pressable
                    onPress={() => setPeriod(30)}
                    className={`px-4 py-2 rounded-full ${period === 30 ? 'bg-focus' : 'bg-surface'}`}
                    accessibilityLabel="Show 30 days"
                    accessibilityRole="button"
                >
                    <Text className={`font-bold text-xs ${period === 30 ? 'text-black' : 'text-gray-500'}`}>30 Days</Text>
                </Pressable>
                <Pressable
                    onPress={() => setPeriod('all')}
                    className={`px-4 py-2 rounded-full ${period === 'all' ? 'bg-focus' : 'bg-surface'}`}
                    accessibilityLabel="Show all time"
                    accessibilityRole="button"
                >
                    <Text className={`font-bold text-xs ${period === 'all' ? 'text-black' : 'text-gray-500'}`}>All Time</Text>
                </Pressable>
            </View>

            {/* Search */}
            <View className="bg-surface border border-dim rounded-xl px-4 py-2 mb-4">
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search history..."
                    placeholderTextColor="#52525b"
                    className="text-white text-sm h-10"
                    accessibilityLabel="Search history"
                />
            </View>

            {/* Stats Summary */}
            <View className="flex-row gap-3 mb-4">
                <View className="flex-1 bg-surface p-3 rounded-xl border border-dim items-center">
                    <Text className="text-gray-500 text-[10px] uppercase font-bold">Showing</Text>
                    <Text className="text-white text-2xl font-black">{filtered.length}</Text>
                </View>
                <View className="flex-1 bg-surface p-3 rounded-xl border border-dim items-center">
                    <Text className="text-gray-500 text-[10px] uppercase font-bold">Total</Text>
                    <Text className="text-primary text-2xl font-black">{history.length}</Text>
                </View>
                <View className="flex-1 bg-surface p-3 rounded-xl border border-dim items-center">
                    <Text className="text-gray-500 text-[10px] uppercase font-bold">Journaled</Text>
                    <Text className="text-focus text-2xl font-black">
                        {history.filter(t => t.journal).length}
                    </Text>
                </View>
            </View>

            {/* History List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {groupedByDate.length === 0 ? (
                    <View className="items-center py-20">
                        <Text className="text-gray-500 text-lg">
                            {search ? 'No matches found' : 'No completed tasks yet'}
                        </Text>
                    </View>
                ) : (
                    groupedByDate.map(([dateKey, tasks]) => (
                        <View key={dateKey} className="mb-6">
                            {/* Date Header */}
                            <View className="flex-row items-center mb-3">
                                <View className="flex-1 h-[1px] bg-dim" />
                                <Text className="text-gray-500 text-xs font-bold uppercase mx-3">
                                    {format(new Date(dateKey), 'EEEE, MMM d')}
                                </Text>
                                <View className="flex-1 h-[1px] bg-dim" />
                            </View>

                            {/* Tasks for this date */}
                            {tasks.map(task => {
                                const taskCategories = task.categories?.map(catId =>
                                    categories.find(c => c.id === catId)
                                ).filter(Boolean) || [];

                                return (
                                    <Pressable
                                        key={task.id}
                                        onLongPress={() => setEditingTask(task)}
                                        className="bg-surface border border-dim rounded-xl p-4 mb-3"
                                    >
                                        {/* Task text */}
                                        <View className="flex-row items-start mb-2">
                                            <Text className="text-primary text-lg mr-2">✓</Text>
                                            <Text className="text-white text-base flex-1 leading-tight">
                                                {task.text}
                                            </Text>
                                        </View>

                                        {/* Categories */}
                                        {taskCategories.length > 0 && (
                                            <View className="flex-row flex-wrap gap-1.5 mb-2">
                                                {taskCategories.map(cat => cat && (
                                                    <View
                                                        key={cat.id}
                                                        className="px-2 py-1 rounded-full"
                                                        style={{ backgroundColor: cat.color + '33' }}
                                                    >
                                                        <Text className="text-xs" style={{ color: cat.color }}>
                                                            {cat.icon} {cat.name}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* Timestamp */}
                                        <Text className="text-gray-600 text-[10px] mb-2">
                                            Completed at {task.completedAt ? format(new Date(task.completedAt), 'h:mm a') : '—'}
                                            {' • Long press to edit'}
                                        </Text>

                                        {/* Journal Entry */}
                                        {task.journal && (
                                            <View className="bg-bg rounded-lg p-3 mt-2 border border-dim/50">
                                                <View className="flex-row items-center mb-2">
                                                    <View className="flex-1 flex-row gap-3">
                                                        <View className="flex-row items-center">
                                                            <Text className="text-gray-500 text-[10px] uppercase font-bold mr-1">
                                                                Energy
                                                            </Text>
                                                            <Text className="text-primary text-sm font-bold">
                                                                {task.journal.energy}/5
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center">
                                                            <Text className="text-gray-500 text-[10px] uppercase font-bold mr-1">
                                                                Focus
                                                            </Text>
                                                            <Text className="text-focus text-sm font-bold">
                                                                {task.journal.focus}/5
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                {task.journal.note && (
                                                    <Text className="text-gray-400 text-sm italic leading-snug">
                                                        "{task.journal.note}"
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Edit Modal */}
            <TaskEditModal
                task={editingTask}
                visible={!!editingTask}
                onClose={() => setEditingTask(null)}
            />
        </SafeAreaView>
    );
}
