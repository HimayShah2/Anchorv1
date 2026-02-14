import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

export default function Brain() {
    const { brainNotes, categories, addNote, deleteNote } = useStore();
    const [search, setSearch] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);

    // Quick templates
    const templates = [
        { name: 'Idea 💡', content: '## Core Idea\n\n## Why This Matters\n\n## Next Steps\n' },
        { name: 'Meeting 📝', content: '## Attendees\n\n## Discussion\n\n## Action Items\n- [ ] \n' },
        { name: 'Daily 📅', content: '## Today\'s Focus\n\n## Wins\n\n## Challenges\n\n## Tomorrow\n' },
        { name: 'Quick 🚀', content: '' },
    ];

    // Filter notes by search
    const filteredNotes = useMemo(() => {
        if (!search.trim()) return brainNotes;
        const query = search.toLowerCase();
        return brainNotes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
    }, [brainNotes, search]);

    const handleAddNote = () => {
        if (!title.trim() && !content.trim()) return;

        const noteTitle = title.trim() || 'Untitled Note';
        addNote(noteTitle, content, selectedCategories);

        // Reset form
        setTitle('');
        setContent('');
        setSelectedCategories([]);
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
                <View>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Second Brain</Text>
                    <Text className="text-white text-3xl font-bold">
                        {filteredNotes.length} {filteredNotes.length === 1 ? 'Note' : 'Notes'}
                    </Text>
                </View>
                <View className="flex-row gap-2">
                    <Link href="/categories" asChild>
                        <Pressable
                            className="bg-surface px-3 py-2 rounded-full border border-dim"
                            accessibilityLabel="Manage categories"
                            accessibilityRole="button"
                        >
                            <Text className="text-primary font-bold text-xs">🏷️</Text>
                        </Pressable>
                    </Link>
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
            </View>

            {/* Search */}
            <View className="bg-surface rounded-2xl px-4 py-3 border border-dim mb-4 flex-row items-center">
                <Text className="text-gray-500 text-lg mr-2">🔍</Text>
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    className="text-white text-base flex-1"
                    placeholder="Search notes, #tags..."
                    placeholderTextColor="#52525b"
                    accessibilityLabel="Search notes"
                />
                {search ? (
                    <Pressable onPress={() => setSearch('')}>
                        <Text className="text-gray-500 text-lg">✕</Text>
                    </Pressable>
                ) : null}
            </View>

            {/* Notes List */}
            <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
                {filteredNotes.length === 0 && !search ? (
                    <View className="items-center justify-center py-12">
                        <Text className="text-gray-500 text-base mb-2">No notes yet</Text>
                        <Text className="text-gray-600 text-sm">Start capturing your ideas below</Text>
                    </View>
                ) : filteredNotes.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <Text className="text-gray-500 text-base">No matching notes</Text>
                    </View>
                ) : (
                    filteredNotes.map(note => {
                        const noteCategories = note.categories.map(getCategoryById).filter(Boolean);
                        return (
                            <Pressable
                                key={note.id}
                                onPress={() => router.push(`/note-editor?id=${note.id}`)}
                                onLongPress={() => {
                                    if (confirm('Delete this note?')) {
                                        deleteNote(note.id);
                                    }
                                }}
                                className="bg-surface p-4 rounded-2xl border border-dim mb-3"
                                accessibilityLabel={`Note: ${note.title}`}
                                accessibilityRole="button"
                            >
                                <Text className="text-white text-lg font-bold mb-1">{note.title}</Text>
                                {note.content && (
                                    <Text className="text-gray-400 text-sm mb-2" numberOfLines={2}>
                                        {note.content}
                                    </Text>
                                )}
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-gray-600 text-xs">
                                        {format(note.updatedAt, 'MMM d, yyyy')}
                                    </Text>
                                    {noteCategories.length > 0 && (
                                        <View className="flex-row gap-1 flex-wrap">
                                            {noteCategories.map(cat => cat && (
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
                                </View>
                            </Pressable>
                        );
                    })
                )}
            </ScrollView>

            {/* Quick Add Note */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="bg-surface rounded-2xl p-4 border border-dim">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-focus text-xs font-bold uppercase">Quick Capture</Text>
                        <Pressable
                            onPress={() => setShowTemplates(!showTemplates)}
                            className="px-2 py-1 rounded-lg bg-dim"
                        >
                            <Text className="text-primary text-xs font-bold">📋 Templates</Text>
                        </Pressable>
                    </View>

                    {/* Templates */}
                    {showTemplates && (
                        <View className="flex-row flex-wrap gap-2 mb-3">
                            {templates.map(template => (
                                <Pressable
                                    key={template.name}
                                    onPress={() => {
                                        setContent(template.content);
                                        setShowTemplates(false);
                                    }}
                                    className="px-3 py-1.5 rounded-full bg-dim border border-primary"
                                >
                                    <Text className="text-primary text-xs font-bold">{template.name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        className="text-white text-base font-bold mb-2"
                        placeholder="Title (optional)"
                        placeholderTextColor="#52525b"
                        accessibilityLabel="Note title"
                    />

                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        className="text-white text-sm mb-3"
                        placeholder="What's on your mind?"
                        placeholderTextColor="#52525b"
                        multiline
                        numberOfLines={3}
                        accessibilityLabel="Note content"
                    />

                    {/* Category chips */}
                    {categories.length > 0 && (
                        <View className="flex-row flex-wrap gap-2 mb-3">
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
                    )}

                    <Pressable
                        onPress={handleAddNote}
                        className="bg-primary h-12 rounded-xl items-center justify-center"
                        accessibilityLabel="Save note"
                        accessibilityRole="button"
                    >
                        <Text className="text-black font-bold text-base">SAVE NOTE</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
