import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns';

export default function Backlog() {
    const { backlog, categories, promote, editTask, deleteTask, reorderBacklog } = useStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'default' | 'deadline'>('default');

    // Filter and sort
    const filtered = useMemo(() => {
        let tasks = search
            ? backlog.filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
            : [...backlog];

        if (sortBy === 'deadline') {
            tasks.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline - b.deadline;
            });
        }

        return tasks;
    }, [backlog, search, sortBy]);

    const getCategoryById = (id: string) => categories.find(c => c.id === id);

    const getDeadlineStatus = (deadline?: number) => {
        if (!deadline) return null;
        const deadlineDate = new Date(deadline);
        if (isPast(deadlineDate) && !isToday(deadlineDate)) return 'overdue';
        if (isToday(deadlineDate)) return 'today';
        if (isTomorrow(deadlineDate)) return 'tomorrow';
        const days = differenceInDays(deadlineDate, new Date());
        if (days <= 3) return 'soon';
        return 'future';
    };

    const startEdit = (id: string, text: string) => {
        setEditingId(id);
        setEditText(text);
    };

    const saveEdit = () => {
        if (editingId && editText.trim()) {
            editTask(editingId, editText.trim());
        }
        setEditingId(null);
        setEditText('');
    };

    const confirmDelete = (id: string, text: string) => {
        Alert.alert('Delete Task', `Remove "${text}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
        ]);
    };

    const moveUp = (index: number) => {
        if (index > 0) reorderBacklog(index, index - 1);
    };

    const moveDown = (index: number) => {
        if (index < backlog.length - 1) reorderBacklog(index, index + 1);
    };

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Backlog',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                }}
            />

                {/* Search Bar */}
                <View className="bg-surface rounded-2xl px-4 py-2 flex-row items-center border border-dim mb-4">
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 text-white text-base"
                        placeholder="Search tasks..."
                        placeholderTextColor="#52525b"
                    />
                    {search && (
                        <Pressable onPress={() => setSearch('')}>
                            <Text className="text-gray-500">✕</Text>
                        </Pressable>
                    )}
                </View>

                {/* Sort Toggle */}
                <View className="flex-row gap-2 mb-4">
                    <Pressable
                        onPress={() => setSortBy('default')}
                        className={`px-4 py-2 rounded-full ${sortBy === 'default' ? 'bg-primary' : 'bg-surface border border-dim'}`}
                    >
                        <Text className={`text-xs font-bold ${sortBy === 'default' ? 'text-black' : 'text-gray-400'}`}>
                            Order Added
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setSortBy('deadline')}
                        className={`px-4 py-2 rounded-full ${sortBy === 'deadline' ? 'bg-panic' : 'bg-surface border border-dim'}`}
                    >
                        <Text className={`text-xs font-bold ${sortBy === 'deadline' ? 'text-white' : 'text-gray-400'}`}>
                            ⏰ By Deadline
                        </Text>
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {filtered.length === 0 ? (
                        <View className="items-center justify-center py-12">
                            <Text className="text-gray-500 text-base">
                                {search ? 'No matching tasks' : 'Backlog empty'}
                            </Text>
                        </View>
                    ) : (
                        filtered.map(task => {
                            const isEditing = editingId === task.id;
                            const deadlineStatus = getDeadlineStatus(task.deadline);
                            const taskCategories = task.categories.map(getCategoryById).filter(Boolean);
                            
                            return (
                                <View
                                    key={task.id}
                                    className={`bg-surface p-4 rounded-2xl mb-3 border ${
                                        deadlineStatus === 'overdue' ? 'border-panic' :
                                        deadlineStatus === 'today' ? 'border-panic' :
                                        deadlineStatus === 'tomorrow' || deadlineStatus === 'soon' ? 'border-focus' :
                                        'border-dim'
                                    }`}
                                >
                                    {isEditing ? (
                                        <View>
                                            <TextInput
                                                value={editText}
                                                onChangeText={setEditText}
                                                className="text-white text-base mb-3 p-2 bg-dim rounded-xl"
                                                multiline
                                                autoFocus
                                            />
                                            <View className="flex-row gap-2">
                                                <Pressable
                                                    onPress={saveEdit}
                                                    className="flex-1 bg-primary py-2 rounded-xl"
                                                >
                                                    <Text className="text-black text-center font-bold">Save</Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => setEditingId(null)}
                                                    className="flex-1 bg-dim py-2 rounded-xl"
                                                >
                                                    <Text className="text-white text-center font-bold">Cancel</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : (
                                        <View>
                                            <Text className="text-white text-base mb-2">{task.text}</Text>
                                            <Pressable
                                                onPress={() => confirmDelete(task.id, task.text)}
                                                className="w-10 bg-panic/20 py-2 rounded-lg items-center justify-center"
                                                accessibilityLabel="Delete task"
                                                accessibilityRole="button"
                                                style={{ minHeight: 40 }}
                                            >
                                                <Text className="text-panic text-xs">✕</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View className="py-3">
                <Text className="text-gray-600 text-xs text-center">
                    {backlog.length} tasks • Tap to edit • Long press to delete
                </Text>
            </View>
        </SafeAreaView >
    );
}
