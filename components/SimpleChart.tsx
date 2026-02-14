import React from 'react';
import { View, Text } from 'react-native';
import { useStore } from '../store/useStore';
import { subDays, isSameDay } from 'date-fns';

interface Props {
    days?: number;
}

export const SimpleChart = ({ days = 7 }: Props) => {
    const history = useStore(s => s.history);
    const dayList = Array.from({ length: days }, (_, i) => subDays(new Date(), days - 1 - i));

    const data = dayList.map(day => {
        const tasks = history.filter(t => t.completedAt && isSameDay(t.completedAt, day));
        const count = tasks.length;
        const avgEnergy = tasks.length > 0
            ? tasks.reduce((sum, t) => sum + (t.journal?.energy ?? 0), 0) / tasks.length
            : 0;
        return { day, count, avgEnergy };
    });
    const max = Math.max(...data.map(d => d.count), 1);

    return (
        <View className="h-40 flex-row items-end justify-between px-2 pt-4">
            {data.map((d, i) => (
                <View key={i} className="items-center flex-1 mx-0.5">
                    <View
                        className="w-4 rounded-t-sm overflow-hidden"
                        style={{ height: `${(d.count / max) * 100}%`, backgroundColor: 'rgba(74, 222, 128, 0.2)' }}
                    >
                        {d.count > 0 && (
                            <View
                                className="w-full rounded-t-sm"
                                style={{
                                    height: '100%',
                                    backgroundColor: d.avgEnergy >= 4 ? '#4ADE80' : d.avgEnergy >= 2 ? '#38BDF8' : '#A78BFA',
                                    opacity: 0.85,
                                }}
                            />
                        )}
                    </View>
                    <Text className="text-gray-500 text-[9px] mt-1.5 font-bold">
                        {days <= 7
                            ? d.day.toLocaleDateString('en-US', { weekday: 'narrow' })
                            : d.day.getDate().toString()}
                    </Text>
                </View>
            ))}
        </View>
    );
};
