// Journal Prompts and Templates
// Used for enhanced interstitial journaling

export interface JournalPrompt {
    id: string;
    text: string;
    category: 'reflection' | 'planning' | 'gratitude' | 'learning';
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
    // Reflection
    { id: 'reflect-1', text: 'What went well with this task?', category: 'reflection' },
    { id: 'reflect-2', text: 'What could you improve next time?', category: 'reflection' },
    { id: 'reflect-3', text: 'What did you learn from completing this?', category: 'reflection' },
    { id: 'reflect-4', text: 'How did this task align with your goals?', category: 'reflection' },

    // Planning
    { id: 'plan-1', text: 'What blockers did you encounter?', category: 'planning' },
    { id: 'plan-2', text: 'What would you do differently?', category: 'planning' },
    { id: 'plan-3', text: 'What follow-up tasks are needed?', category: 'planning' },

    // Gratitude
    { id: 'gratitude-1', text: 'What are you grateful for right now?', category: 'gratitude' },
    { id: 'gratitude-2', text: 'What help or support did you receive?', category: 'gratitude' },

    // Learning
    { id: 'learning-1', text: 'What new insight did you gain?', category: 'learning' },
    { id: 'learning-2', text: 'What surprised you about this task?', category: 'learning' },
    { id: 'learning-3', text: 'How can you apply this learning?', category: 'learning' },
];

// Mood tags for journal entries
export const MOOD_TAGS = [
    { id: 'productive', label: '🚀 Productive', color: '#10b981' },
    { id: 'flow', label: '🌊 Flow State', color: '#3b82f6' },
    { id: 'focused', label: '🎯 Focused', color: '#8b5cf6' },
    { id: 'distracted', label: '😵 Distracted', color: '#ef4444' },
    { id: 'energized', label: '⚡ Energized', color: '#f59e0b' },
    { id: 'tired', label: '😴 Tired', color: '#6b7280' },
    { id: 'stressed', label: '😰 Stressed', color: '#dc2626' },
    { id: 'calm', label: '😌 Calm', color: '#06b6d4' },
    { id: 'creative', label: '🎨 Creative', color: '#ec4899' },
    { id: 'blocked', label: '🚧 Blocked', color: '#f97316' },
];

// Get a random prompt
export function getRandomPrompt(category?: JournalPrompt['category']): JournalPrompt {
    const filtered = category
        ? JOURNAL_PROMPTS.filter(p => p.category === category)
        : JOURNAL_PROMPTS;

    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
}

// Get prompt based on time of day
export function getContextualPrompt(): JournalPrompt {
    const hour = new Date().getHours();

    // Morning (5-11): Planning prompts
    if (hour >= 5 && hour < 12) {
        return getRandomPrompt('planning');
    }

    // Afternoon (12-17): Learning prompts
    if (hour >= 12 && hour < 18) {
        return getRandomPrompt('learning');
    }

    // Evening (18-21): Reflection prompts
    if (hour >= 18 && hour < 22) {
        return getRandomPrompt('reflection');
    }

    // Night (22-4): Gratitude prompts
    return getRandomPrompt('gratitude');
}
