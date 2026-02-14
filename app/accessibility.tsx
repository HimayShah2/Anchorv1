import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useStore } from '../store/useStore';

export default function AccessibilityScreen() {
    const { settings, updateSettings } = useStore();

    const fontSizeOptions: Array<{ label: string; value: typeof settings.fontSize }> = [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'X-Large', value: 'xlarge' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Accessibility',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>
                <Text className="text-white text-xl font-bold mb-4">♿ Accessibility Options</Text>

                {/* Font Size */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Font Size</Text>
                <View className="flex-row gap-2 mb-6">
                    {fontSizeOptions.map(opt => (
                        <Pressable
                            key={opt.value}
                            onPress={() => updateSettings({ fontSize: opt.value })}
                            className={`flex-1 py-3 rounded-xl items-center ${settings.fontSize === opt.value ? 'bg-primary' : 'bg-surface border border-dim'}`}
                            accessibilityLabel={`Set font size to ${opt.label}`}
                            accessibilityRole="button"
                            style={{ minHeight: 48 }}
                        >
                            <Text
                                className={`font-bold ${settings.fontSize === opt.value ? 'text-black' : 'text-gray-400'}`}
                                style={{
                                    fontSize: opt.value === 'small' ? 10 : opt.value === 'medium' ? 12 : opt.value === 'large' ? 14 : 16,
                                }}
                            >
                                {opt.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* High Contrast Mode */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Display</Text>
                <Pressable
                    onPress={() => updateSettings({ highContrast: !settings.highContrast })}
                    className="bg-surface border border-dim rounded-xl p-4 flex-row justify-between items-center mb-3"
                    accessibilityLabel="Toggle high contrast mode"
                    accessibilityRole="switch"
                    style={{ minHeight: 48 }}
                >
                    <View>
                        <Text className="text-white font-bold">High Contrast Mode</Text>
                        <Text className="text-gray-500 text-xs">Increase text and UI contrast</Text>
                    </View>
                    <View className={`w-12 h-7 rounded-full justify-center ${settings.highContrast ? 'bg-primary items-end' : 'bg-dim items-start'}`}>
                        <View className="w-5 h-5 bg-white rounded-full mx-1" />
                    </View>
                </Pressable>

                {/* Reduce Animations */}
                <Pressable
                    onPress={() => updateSettings({ reduceAnimations: !settings.reduceAnimations })}
                    className="bg-surface border border-dim rounded-xl p-4 flex-row justify-between items-center mb-6"
                    accessibilityLabel="Toggle reduce animations"
                    accessibilityRole="switch"
                    style={{ minHeight: 48 }}
                >
                    <View>
                        <Text className="text-white font-bold">Reduce Animations</Text>
                        <Text className="text-gray-500 text-xs">Minimize motion and transitions</Text>
                    </View>
                    <View className={`w-12 h-7 rounded-full justify-center ${settings.reduceAnimations ? 'bg-primary items-end' : 'bg-dim items-start'}`}>
                        <View className="w-5 h-5 bg-white rounded-full mx-1" />
                    </View>
                </Pressable>

                {/* Screen Reader Info */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Screen Reader</Text>
                <View className="bg-surface/50 border border-dim/50 rounded-xl p-4 mb-6">
                    <Text className="text-white text-sm mb-2">✓ Screen Reader Optimized</Text>
                    <Text className="text-gray-500 text-xs leading-relaxed">
                        This app includes accessibility labels and proper navigation for TalkBack (Android) and VoiceOver (iOS).
                    </Text>
                </View>

                {/* Touch Targets Info */}
                <Text className="text-gray-500 font-bold uppercase text-xs mb-2">Touch Targets</Text>
                <View className="bg-surface/50 border border-dim/50 rounded-xl p-4 mb-8">
                    <Text className="text-white text-sm mb-2">✓ Large Touch Targets</Text>
                    <Text className="text-gray-500 text-xs leading-relaxed">
                        All interactive elements meet the 48x48dp minimum size recommendation for easier tapping.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
