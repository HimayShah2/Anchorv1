import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useStore } from '../store/useStore';

// Predefined colors
const PRESET_COLORS = [
    '#10b981', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // orange
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
];

// Preset emoji icons with better variety
const PRESET_ICONS = [
    '💼', '🏠', '💪', '📚', '💡', '🎯', '🚀', '⭐',
    '🔥', '✨', '🎨', '🎵', '🎮', '⚡', '🌟', '💻',
    '📱', '✅', '🏃', '🧠', '❤️', '🌈', '🔔', '📝',
    '🎓', '🛠️', '🌱', '⚙️', '🏆', '🎁', '📊', '🗂️'
];

export default function Categories() {
    const { categories, addCategory, updateCategory, deleteCategory, brainNotes, stack, backlog, history } = useStore();

    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        if (!newName.trim()) return;

        if (editingId) {
            updateCategory(editingId, {
                name: newName.trim(),
                color: selectedColor,
                icon: selectedIcon,
            });
            setEditingId(null);
        } else {
            addCategory(newName.trim(), selectedColor, selectedIcon);
        }

        setNewName('');
        setSelectedColor(PRESET_COLORS[0]);
        setSelectedIcon(PRESET_ICONS[0]);
    };

    const handleEdit = (cat: typeof categories[0]) => {
        setEditingId(cat.id);
        setNewName(cat.name);
        setSelectedColor(cat.color);
        setSelectedIcon(cat.icon || PRESET_ICONS[0]);
    };

    const getCategoryUsage = (categoryId: string) => {
        const tasksCount = [...stack, ...backlog, ...history].filter(t =>
            t.categories.includes(categoryId)
        ).length;
        const notesCount = brainNotes.filter(n => n.categories.includes(categoryId)).length;
        return { tasks: tasksCount, notes: notesCount };
    };

    return (
        <SafeAreaView className="flex-1 px-6 py-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Categories</Text>
                    <Text className="text-white text-3xl font-bold">{categories.length} Labels</Text>
                </View>
                <Link href="/" asChild>
                    <Pressable
                        className="bg-surface px-3 py-2 rounded-full border border-dim"
                        accessibilityLabel="Go back home"
                        accessibilityRole="button"
                    >
                        <Text className="text-gray-400 font-bold text-xs">✕</Text>
                    </Pressable>
                </Link>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Category List */}
                <View className="mb-6">
                    {categories.length === 0 ? (
                        <View className="items-center justify-center py-8">
                            <Text className="text-gray-500 text-base mb-2">No categories yet</Text>
                            <Text className="text-gray-600 text-sm">Create one below to organize your work</Text>
                        </View>
                    ) : (
                        categories.map(cat => {
                            const usage = getCategoryUsage(cat.id);
                            return (
                                <View
                                    key={cat.id}
                                    className="bg-surface p-4 rounded-2xl border border-dim mb-3"
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center gap-2">
                                            <View
                                                className="w-10 h-10 rounded-full items-center justify-center"
                                                style={{ backgroundColor: cat.color }}
                                            >
                                                <Text className="text-lg">{cat.icon}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-white text-lg font-bold">{cat.name}</Text>
                                                <Text className="text-gray-500 text-xs">
                                                    {usage.tasks} tasks, {usage.notes} notes
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <Pressable
                                                onPress={() => handleEdit(cat)}
                                                className="bg-dim px-3 py-1.5 rounded-lg"
                                                accessibilityLabel="Edit category"
                                                accessibilityRole="button"
                                            >
                                                <Text className="text-white text-xs font-bold">Edit</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => {
                                                    if (usage.tasks + usage.notes > 0) {
                                                        alert(`Cannot delete: ${usage.tasks + usage.notes} items use this category`);
                                                    } else {
                                                        deleteCategory(cat.id);
                                                    }
                                                }}
                                                className="bg-panic px-3 py-1.5 rounded-lg"
                                                accessibilityLabel="Delete category"
                                                accessibilityRole="button"
                                            >
                                                <Text className="text-white text-xs font-bold">🗑️</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Create/Edit Form */}
                <View className="bg-surface rounded-2xl p-4 border border-dim mb-4">
                    <Text className="text-focus text-xs font-bold uppercase mb-3">
                        {editingId ? 'Edit Category' : 'New Category'}
                    </Text>

                    {/* Name Input */}
                    <TextInput
                        value={newName}
                        onChangeText={setNewName}
                        className="bg-dim text-white text-base px-4 py-3 rounded-xl mb-3"
                        placeholder="Category name..."
                        placeholderTextColor="#52525b"
                        accessibilityLabel="Category name"
                    />

                    {/* Icon Selector */}
                    <Text className="text-gray-400 text-xs mb-2">Icon</Text>
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {PRESET_ICONS.map(icon => (
                            <Pressable
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                className="w-12 h-12 rounded-xl items-center justify-center"
                                style={{
                                    backgroundColor: selectedIcon === icon ? selectedColor : '#27272a',
                                    borderWidth: 2,
                                    borderColor: selectedIcon === icon ? selectedColor : '#3f3f46',
                                }}
                            >
                                <Text className="text-xl">{icon}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Color Selector */}
                    <Text className="text-gray-400 text-xs mb-2">Color</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {PRESET_COLORS.map(color => (
                            <Pressable
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className="w-12 h-12 rounded-xl"
                                style={{
                                    backgroundColor: color,
                                    borderWidth: 3,
                                    borderColor: selectedColor === color ? '#fff' : 'transparent',
                                }}
                            />
                        ))}
                    </View>

                    {/* Preview */}
                    <View className="bg-dim p-3 rounded-xl mb-4 flex-row items-center gap-2">
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: selectedColor }}
                        >
                            <Text className="text-lg">{selectedIcon}</Text>
                        </View>
                        <Text className="text-white font-bold">
                            {newName || 'Preview'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                        {editingId && (
                            <Pressable
                                onPress={() => {
                                    setEditingId(null);
                                    setNewName('');
                                    setSelectedColor(PRESET_COLORS[0]);
                                    setSelectedIcon(PRESET_ICONS[0]);
                                }}
                                className="flex-1 bg-dim h-12 rounded-xl items-center justify-center"
                                accessibilityLabel="Cancel edit"
                                accessibilityRole="button"
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={handleAdd}
                            className="flex-1 bg-primary h-12 rounded-xl items-center justify-center"
                            accessibilityLabel={editingId ? 'Update category' : 'Create category'}
                            accessibilityRole="button"
                        >
                            <Text className="text-black font-bold">
                                {editingId ? 'UPDATE' : 'CREATE'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
