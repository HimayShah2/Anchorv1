import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
    onResult: (text: string) => void;
}

// Check if native module is available
let ExpoSpeechRecognitionModule: any;
let useSpeechRecognitionEvent: any;
let isVoiceAvailable = false;

try {
    const speechModule = require('@jamsch/expo-speech-recognition');
    ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
    isVoiceAvailable = true;
} catch (e) {
    // Native module not available (Expo Go) - voice input disabled
    isVoiceAvailable = false;
}

export const VoiceInput = ({ onResult }: Props) => {
    const [listening, setListening] = useState(false);

    // Only use hooks if module is available
    if (isVoiceAvailable && useSpeechRecognitionEvent) {
        useSpeechRecognitionEvent('result', (event: any) => {
            const transcript = event.results[0]?.transcript;
            if (transcript) {
                onResult(transcript);
            }
        });

        useSpeechRecognitionEvent('end', () => {
            setListening(false);
        });

        useSpeechRecognitionEvent('error', () => {
            setListening(false);
        });
    }

    const toggle = useCallback(async () => {
        if (!isVoiceAvailable) {
            return; // Silently fail in Expo Go
        }

        if (listening) {
            ExpoSpeechRecognitionModule.stop();
            setListening(false);
            return;
        }

        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) return;

        ExpoSpeechRecognitionModule.start({
            lang: 'en-US',
            interimResults: false,
            maxAlternatives: 1,
        });
        setListening(true);
    }, [listening]);

    // Don't render if voice input not available
    if (!isVoiceAvailable) {
        return null;
    }

    return (
        <Pressable
            onPress={toggle}
            className={`w-10 h-10 rounded-xl items-center justify-center ${listening ? 'bg-panic' : 'bg-dim'}`}
            accessibilityLabel={listening ? 'Stop voice input' : 'Start voice input'}
            accessibilityRole="button"
        >
            <Text className="text-white text-lg">{listening ? '⏹' : '🎤'}</Text>
        </Pressable>
    );
};
