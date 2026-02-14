import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function NoteEditor() {
    const params = useLocalSearchParams();
    const noteId = params.id as string;

    const { brainNotes, categories, updateNote, deleteNote, addNote } = useStore();
    const note = brainNotes.find(n => n.id === noteId);

    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(note?.categories || []);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSelectedCategories(note.categories);
        }
    }, [note]);

    const handleSave = () => {
        if (!title.trim() && !content.trim()) return;

        const noteTitle = title.trim() || 'Untitled Note';

        if (noteId && note) {
            updateNote(noteId, {
                title: noteTitle,
                content,
                categories: selectedCategories,
            });
        } else {
            addNote(noteTitle, content, selectedCategories);
        }

        router.back();
    };

    const handleDelete = () => {
        if (noteId) {
            deleteNote(noteId);
            router.back();
        }
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    const getCategoryById = (id: string) => categories.find(c => c.id === id);

    return (
        <SafeAreaView className="flex-1 px-6 py-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-2xl font-bold">
                    {noteId ? 'Edit Note' : 'New Note'}
                </Text>
                <View className="flex-row gap-2">
                    {noteId && (
                        <Pressable
                            onPress={handleDelete}
                            className="bg-panic px-4 py-2 rounded-full"
                            accessibilityLabel="Delete note"
                            accessibilityRole="button"
                        >
                            <Text className="text-white font-bold text-xs">🗑️ Delete</Text>
                        </Pressable>
                    )}
                    <Pressable
                        onPress={() => router.back()}
                        className="bg-surface px-3 py-2 rounded-full border border-dim"
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Text className="text-gray-400 font-bold text-xs">✕</Text>
                    </Pressable>
                </View>
            </View>

            {note && (
                <View className="mb-4">
                    <Text className="text-gray-500 text-xs">
                        Created {format(note.createdAt, 'MMM d, yyyy h:mm a')}
                    </Text>
                    {note.updatedAt !== note.createdAt && (
                        <Text className="text-gray-600 text-xs">
                            Updated {format(note.updatedAt, 'MMM d, yyyy h:mm a')}
                        </Text>
                    )}
                </View>
            )}

            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Title */}
                    <View className="bg-surface rounded-2xl p-4 border border-dim mb-4">
                        <Text className="text-focus text-xs font-bold uppercase mb-2">Title</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            className="text-white text-xl font-bold"
                            placeholder="Untitled Note"
                            placeholderTextColor="#52525b"
                            accessibilityLabel="Note title"
                        />
                    </View>

                    {/* Content */}
                    <View className="bg-surface rounded-2xl p-4 border border-dim mb-4 flex-1">
                        <Text className="text-focus text-xs font-bold uppercase mb-2">Content (Markdown)</Text>
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            className="text-white text-base flex-1"
                            placeholder="Write your thoughts here... (Markdown supported)"
                            placeholderTextColor="#52525b"
                            multiline
                            textAlignVertical="top"
                            style={{ minHeight: 200 }}
                            accessibilityLabel="Note content"
                        />
                    </View>

                    {/* Categories */}
                    <View className="bg-surface rounded-2xl p-4 border border-dim mb-4">
                        <Text className="text-focus text-xs font-bold uppercase mb-3">Categories</Text>
                        {categories.length === 0 ? (
                            <Text className="text-gray-500 text-sm">
                                No categories yet. Create one in settings!
                            </Text>
                        ) : (
                            <View className="flex-row flex-wrap gap-2">
                                {categories.map(cat => {
                                    const isSelected = selectedCategories.includes(cat.id);
                                    return (
                                        <Pressable
                                            key={cat.id}
                                            onPress={() => toggleCategory(cat.id)}
                                            className="px-3 py-2 rounded-full"
                                            style={{
                                                backgroundColor: isSelected ? cat.color : cat.color + '22',
                                                borderWidth: 1,
                                                borderColor: cat.color,
                                            }}
                                        >
                                            <Text
                                                className="text-sm font-bold"
                                                style={{ color: isSelected ? '#000' : cat.color }}
                                            >
                                                {cat.icon} {cat.name}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Linked Tasks (future feature) */}
                    {note && note.linkedTasks.length > 0 && (
                        <View className="bg-surface rounded-2xl p-4 border border-dim mb-4">
                            <Text className="text-focus text-xs font-bold uppercase mb-2">Linked Tasks</Text>
                            <Text className="text-gray-400 text-sm">
                                {note.linkedTasks.length} task(s) linked
                            </Text>
                        </View>
                    )}
                </ScrollView>

                {/* Save Button */}
                <Pressable
                    onPress={handleSave}
                    className="bg-primary h-14 rounded-xl items-center justify-center mt-4"
                    accessibilityLabel="Save note"
                    accessibilityRole="button"
                >
                    <Text className="text-black font-bold text-lg">SAVE NOTE</Text>
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
