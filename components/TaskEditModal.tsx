import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import type { Task } from '../store/useStore';

interface TaskEditModalProps {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
}

export default function TaskEditModal({ task, visible, onClose }: TaskEditModalProps) {
    const { categories, editTask, setTaskDeadline, setTaskCategories } = useStore();

    const [text, setText] = useState(task?.text || '');
    const [deadline, setDeadline] = useState<Date | undefined>(task?.deadline ? new Date(task.deadline) : undefined);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(task?.categories || []);
    const [showDatePicker, setShowDatePicker] = useState(false);

    React.useEffect(() => {
        if (task) {
            setText(task.text);
            setDeadline(task.deadline ? new Date(task.deadline) : undefined);
            setSelectedCategories(task.categories || []);
        }
    }, [task]);

    const handleSave = () => {
        if (!task) return;

        if (text.trim()) {
            editTask(task.id, text.trim());
        }

        setTaskDeadline(task.id, deadline ? deadline.getTime() : null);
        setTaskCategories(task.id, selectedCategories);

        onClose();
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    if (!task) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                className="flex-1 bg-black/70 justify-end"
            >
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    className="bg-bg rounded-t-3xl p-6"
                    style={{ maxHeight: '80%' }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-xl font-bold">Edit Task</Text>
                        <Pressable onPress={onClose}>
                            <Text className="text-gray-400 text-2xl">✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Task Text */}
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Task Name</Text>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            className="bg-surface text-white p-4 rounded-xl border border-dim mb-4"
                            placeholder="Task name..."
                            placeholderTextColor="#52525b"
                            multiline
                        />

                        {/* Deadline */}
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Deadline</Text>
                        <View className="flex-row gap-2 mb-4">
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                className={`flex-1 px-4 py-3 rounded-xl ${deadline ? 'bg-panic' : 'bg-surface border border-dim'}`}
                            >
                                <Text className={`text-sm font-bold ${deadline ? 'text-white' : 'text-gray-400'}`}>
                                    {deadline ? `⏰ ${format(deadline, 'MMM d, yyyy')}` : '📅 Set Deadline'}
                                </Text>
                            </Pressable>
                            {deadline && (
                                <Pressable
                                    onPress={() => setDeadline(undefined)}
                                    className="px-4 py-3 rounded-xl bg-dim"
                                >
                                    <Text className="text-gray-400 font-bold">Clear</Text>
                                </Pressable>
                            )}
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={deadline || new Date()}
                                mode="date"
                                display="default"
                                minimumDate={new Date()}
                                onChange={(event: any, selectedDate?: Date) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setDeadline(selectedDate);
                                    }
                                }}
                            />
                        )}

                        {/* Categories */}
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Categories</Text>
                        {categories.length === 0 ? (
                            <Text className="text-gray-500 text-sm mb-4">No categories created yet</Text>
                        ) : (
                            <View className="flex-row flex-wrap gap-2 mb-4">
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

                        {/* Save Button */}
                        <Pressable
                            onPress={handleSave}
                            className="bg-primary py-4 rounded-xl mt-4"
                        >
                            <Text className="text-black text-center font-bold text-lg">Save Changes</Text>
                        </Pressable>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
