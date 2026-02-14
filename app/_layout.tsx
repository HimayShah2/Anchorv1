import "../global.css";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JournalModal } from '../components/JournalModal';

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1 bg-bg">
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#000000' },
                        animation: 'slide_from_right',
                    }}
                />
                <JournalModal />
            </View>
        </GestureHandlerRootView>
    );
}
