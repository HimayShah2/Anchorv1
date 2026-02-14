import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';
import { SimpleChart } from '../components/SimpleChart';
import { subDays, isSameDay, differenceInDays, startOfDay } from 'date-fns';

export default function Analytics() {
    const history = useStore(s => s.history);
    const stack = useStore(s => s.stack);
    const backlog = useStore(s => s.backlog);
    const [period, setPeriod] = useState<7 | 30>(7);

    // Streak calculation
    const streak = useMemo(() => {
        let count = 0;
        let day = startOfDay(new Date());
        while (true) {
            const hasTask = history.some(t => t.completedAt && isSameDay(t.completedAt, day));
            if (!hasTask && count > 0) break;
            if (hasTask) count++;
            day = subDays(day, 1);
            if (count === 0 && !hasTask) break;
        }
        return count;
    }, [history]);

    // Completion rate
    const totalCreated = history.length + stack.length + backlog.length;
    const completionRate = totalCreated > 0 ? Math.round((history.length / totalCreated) * 100) : 0;

    // Average energy & focus
    const journaled = history.filter(t => t.journal);
    const avgEnergy = journaled.length > 0
        ? (journaled.reduce((s, t) => s + (t.journal?.energy ?? 0), 0) / journaled.length).toFixed(1)
        : '—';
    const avgFocus = journaled.length > 0
        ? (journaled.reduce((s, t) => s + (t.journal?.focus ?? 0), 0) / journaled.length).toFixed(1)
        : '—';

    // Hour-of-day heatmap (24 cells)
    const hourData = useMemo(() => {
        const hours = Array(24).fill(0);
        const periodDays = period;
        const cutoff = subDays(new Date(), periodDays).getTime();
        history.forEach(t => {
            if (t.completedAt && t.completedAt >= cutoff) {
                const hour = new Date(t.completedAt).getHours();
                hours[hour]++;
            }
        });
        const maxH = Math.max(...hours, 1);
        return hours.map((count, hour) => ({ hour, count, intensity: count / maxH }));
    }, [history, period]);

    return (
        <SafeAreaView className="flex-1 bg-bg px-4">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Analytics',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                }}
            />
            <ScrollView className="mt-2" showsVerticalScrollIndicator={false}>

                {/* Period Toggle */}
                <View className="flex-row gap-2 mb-4">
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
                </View>

                {/* Completion Chart */}
                <View className="bg-surface p-4 rounded-3xl border border-dim mb-4">
                    <Text className="text-white font-bold mb-2 text-lg">Completions</Text>
                    <SimpleChart days={period} />
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-3 mb-4">
                    <View className="flex-1 min-w-[45%] bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">Total Done</Text>
                        <Text className="text-white text-3xl font-black">{history.length}</Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">Streak</Text>
                        <Text className="text-primary text-3xl font-black">{streak}🔥</Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">Completion</Text>
                        <Text className="text-focus text-3xl font-black">{completionRate}%</Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">In Stack</Text>
                        <Text className="text-white text-3xl font-black">{stack.length}</Text>
                    </View>
                </View>

                {/* Energy & Focus */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">Avg Energy</Text>
                        <Text className="text-primary text-2xl font-black">{avgEnergy}</Text>
                    </View>
                    <View className="flex-1 bg-surface p-4 rounded-2xl border border-dim items-center">
                        <Text className="text-gray-500 text-[10px] uppercase font-bold">Avg Focus</Text>
                        <Text className="text-focus text-2xl font-black">{avgFocus}</Text>
                    </View>
                </View>

                {/* Hour-of-Day Heatmap */}
                <View className="bg-surface p-4 rounded-3xl border border-dim mb-6">
                    <Text className="text-white font-bold mb-3 text-lg">Peak Hours</Text>
                    <View className="flex-row flex-wrap gap-1">
                        {hourData.map(h => (
                            <View
                                key={h.hour}
                                className="rounded-sm items-center justify-center"
                                style={{
                                    width: '11.5%',
                                    aspectRatio: 1,
                                    backgroundColor: h.count > 0
                                        ? `rgba(74, 222, 128, ${0.15 + h.intensity * 0.7})`
                                        : '#1a1a1a',
                                }}
                            >
                                <Text className="text-gray-500 text-[8px] font-bold">
                                    {h.hour.toString().padStart(2, '0')}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text className="text-gray-600 text-[10px] mt-2 text-center">
                        Darker = more tasks completed at that hour
                    </Text>
                </View>

                {/* Recent History */}
                <View className="mb-8">
                    <Text className="text-gray-500 font-bold mb-2 uppercase text-xs">Recent History</Text>
                    {history.slice(0, 10).map(t => (
                        <View key={t.id} className="bg-surface p-3 rounded-xl border border-dim mb-2">
                            <Text className="text-white text-sm">{t.text}</Text>
                            <View className="flex-row justify-between mt-1">
                                <Text className="text-gray-600 text-[10px]">
                                    {t.completedAt ? new Date(t.completedAt).toLocaleString() : ''}
                                </Text>
                                {t.journal && (
                                    <Text className="text-gray-500 text-[10px]">
                                        ⚡{t.journal.energy} 🎯{t.journal.focus}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
