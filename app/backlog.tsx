import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Backlog() {
    const { backlog, promote, editTask, deleteTask, reorderBacklog } = useStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [search, setSearch] = useState('');

    const filtered = search
        ? backlog.filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
        : backlog;

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

            {/* Search */}
            <View className="bg-surface border border-dim rounded-xl px-4 py-2 mt-2 mb-4">
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search backlog..."
                    placeholderTextColor="#52525b"
                    className="text-white text-sm h-10"
                    accessibilityLabel="Search backlog"
                />
            </View>

            <ScrollView className="flex-1">
                {filtered.length === 0 ? (
                    <View className="items-center py-20">
                        <Text className="text-gray-500 text-lg">
                            {search ? 'No matches found' : 'Backlog is empty'}
                        </Text>
                    </View>
                ) : (
                    filtered.map((task, index) => {
                        const realIndex = backlog.findIndex(t => t.id === task.id);
                        return (
                            <View
                                key={task.id}
                                className="bg-surface border border-dim rounded-xl mb-2 overflow-hidden"
                            >
                                {editingId === task.id ? (
                                    <View className="p-4">
                                        <TextInput
                                            value={editText}
                                            onChangeText={setEditText}
                                            onSubmitEditing={saveEdit}
                                            onBlur={saveEdit}
                                            autoFocus
                                            className="text-white text-base bg-bg border border-dim rounded-lg px-3 py-2"
                                            accessibilityLabel="Edit task text"
                                        />
                                    </View>
                                ) : (
                                    <View className="p-4">
                                        <Pressable
                                            onPress={() => startEdit(task.id, task.text)}
                                            onLongPress={() => confirmDelete(task.id, task.text)}
                                            accessibilityLabel={`Task: ${task.text}. Tap to edit, long press to delete`}
                                            accessibilityRole="button"
                                            style={{ minHeight: 48 }}
                                        >
                                            <Text className="text-white text-base mb-2">{task.text}</Text>
                                            <Text className="text-gray-600 text-[10px]">
                                                Added {new Date(task.createdAt).toLocaleDateString()}
                                            </Text>
                                        </Pressable>

                                        <View className="flex-row gap-2 mt-3">
                                            <Pressable
                                                onPress={() => promote(task.id)}
                                                className="flex-1 bg-primary/20 py-2 rounded-lg items-center"
                                                accessibilityLabel="Promote to stack"
                                                accessibilityRole="button"
                                                style={{ minHeight: 40 }}
                                            >
                                                <Text className="text-primary font-bold text-xs">▲ Promote</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => moveUp(realIndex)}
                                                className="w-10 bg-dim py-2 rounded-lg items-center justify-center"
                                                accessibilityLabel="Move up"
                                                accessibilityRole="button"
                                                style={{ minHeight: 40 }}
                                            >
                                                <Text className="text-white text-xs">↑</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => moveDown(realIndex)}
                                                className="w-10 bg-dim py-2 rounded-lg items-center justify-center"
                                                accessibilityLabel="Move down"
                                                accessibilityRole="button"
                                                style={{ minHeight: 40 }}
                                            >
                                                <Text className="text-white text-xs">↓</Text>
                                            </Pressable>
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
        </SafeAreaView>
    );
}
