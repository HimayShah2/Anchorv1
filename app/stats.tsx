import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';
import { SimpleChart } from '../components/SimpleChart';

export default function Stats() {
    const { history, exportData, panic } = useStore();

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen options={{ headerShown: true, title: 'Momentum', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff' }} />
            <ScrollView className="mt-4">

                <View className="bg-surface p-4 rounded-3xl border border-dim mb-6">
                    <Text className="text-white font-bold mb-4 text-lg">Last 7 Days</Text>
                    <SimpleChart />
                </View>

                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-xs uppercase">Total Done</Text>
                        <Text className="text-white text-4xl font-black">{history.length}</Text>
                    </View>
                    <View className="flex-1 bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-xs uppercase">Stack</Text>
                        <Text className="text-white text-4xl font-black">{useStore.getState().stack.length}</Text>
                    </View>
                </View>

                <Text className="text-gray-500 font-bold mb-2 uppercase text-xs">Data Management</Text>
                <Pressable onPress={exportData} className="bg-dim p-4 rounded-xl mb-3">
                    <Text className="text-white font-bold text-center">☁️ Backup JSON</Text>
                </Pressable>
                <Pressable onPress={panic} className="bg-panic/20 p-4 rounded-xl border border-panic/50">
                    <Text className="text-panic font-bold text-center">⚠️ Factory Reset</Text>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}
