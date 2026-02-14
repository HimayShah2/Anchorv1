import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from '@jamsch/expo-speech-recognition';

interface Props {
    onResult: (text: string) => void;
}

export const VoiceInput = ({ onResult }: Props) => {
    const [listening, setListening] = useState(false);

    useSpeechRecognitionEvent('result', (event) => {
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

    const toggle = useCallback(async () => {
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
