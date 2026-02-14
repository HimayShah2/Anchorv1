import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// --- Types ---

export interface JournalEntry {
    energy: number;   // 1-5
    focus: number;    // 1-5
    note: string;
}

export interface Task {
    id: string;
    text: string;
    type: 'NOW' | 'LATER' | 'DONE';
    createdAt: number;
    completedAt?: number;
    journal?: JournalEntry;
}

export interface Settings {
    timerMinutes: number;
    hapticStrength: 'off' | 'light' | 'medium' | 'heavy';
    notifyOnComplete: boolean;
    dailyReminderHour: number | null;
}

interface AppState {
    // Data
    stack: Task[];
    backlog: Task[];
    history: Task[];
    timerStart: number | null;
    pendingJournalTaskId: string | null;
    settings: Settings;

    // Stack Actions
    addTask: (text: string, isNow: boolean) => void;
    completeTop: () => void;
    deferTop: () => void;
    promote: (id: string) => void;
    panic: () => void;

    // Journal
    logJournal: (taskId: string, entry: JournalEntry) => void;
    dismissJournal: () => void;

    // Backlog Management
    reorderBacklog: (fromIndex: number, toIndex: number) => void;
    editTask: (id: string, newText: string) => void;
    deleteTask: (id: string) => void;

    // Settings
    updateSettings: (partial: Partial<Settings>) => void;

    // Data Management
    exportData: () => Promise<void>;
    exportCSV: () => Promise<void>;
    importData: (json: string) => void;
}

const DEFAULT_SETTINGS: Settings = {
    timerMinutes: 25,
    hapticStrength: 'medium',
    notifyOnComplete: true,
    dailyReminderHour: 9,
};

const hapticMap = {
    off: null,
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

function doHaptic(strength: Settings['hapticStrength']) {
    const style = hapticMap[strength];
    if (style) Haptics.impactAsync(style);
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            stack: [],
            backlog: [],
            history: [],
            timerStart: null,
            pendingJournalTaskId: null,
            settings: DEFAULT_SETTINGS,

            addTask: (text, isNow) => {
                doHaptic(get().settings.hapticStrength);
                const task: Task = {
                    id: Date.now().toString(),
                    text,
                    type: isNow ? 'NOW' : 'LATER',
                    createdAt: Date.now(),
                };
                if (isNow) {
                    set(s => ({ stack: [task, ...s.stack], timerStart: Date.now() }));
                } else {
                    set(s => ({ backlog: [...s.backlog, task] }));
                }
            },

            completeTop: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                const { stack } = get();
                if (stack.length === 0) return;
                const [done, ...rest] = stack;
                const completed = { ...done, type: 'DONE' as const, completedAt: Date.now() };
                set({
                    stack: rest,
                    history: [completed, ...get().history],
                    timerStart: rest.length > 0 ? Date.now() : null,
                    pendingJournalTaskId: completed.id,
                });
            },

            deferTop: () => {
                const { stack, backlog } = get();
                if (stack.length === 0) return;
                const [deferred, ...rest] = stack;
                set({
                    stack: rest,
                    backlog: [...backlog, { ...deferred, type: 'LATER' }],
                    timerStart: rest.length > 0 ? Date.now() : null,
                });
            },

            promote: (id) => {
                const { backlog, stack } = get();
                const task = backlog.find(t => t.id === id);
                if (!task) return;
                set({
                    backlog: backlog.filter(t => t.id !== id),
                    stack: [{ ...task, type: 'NOW' }, ...stack],
                    timerStart: Date.now(),
                });
            },

            panic: () => {
                doHaptic('heavy');
                set({ stack: [], timerStart: null });
            },

            // Journal
            logJournal: (taskId, entry) => {
                set(s => ({
                    history: s.history.map(t =>
                        t.id === taskId ? { ...t, journal: entry } : t
                    ),
                    pendingJournalTaskId: null,
                }));
            },

            dismissJournal: () => set({ pendingJournalTaskId: null }),

            // Backlog Management
            reorderBacklog: (fromIndex, toIndex) => {
                set(s => {
                    const newBacklog = [...s.backlog];
                    const [moved] = newBacklog.splice(fromIndex, 1);
                    newBacklog.splice(toIndex, 0, moved);
                    return { backlog: newBacklog };
                });
            },

            editTask: (id, newText) => {
                set(s => ({
                    stack: s.stack.map(t => (t.id === id ? { ...t, text: newText } : t)),
                    backlog: s.backlog.map(t => (t.id === id ? { ...t, text: newText } : t)),
                }));
            },

            deleteTask: (id) => {
                set(s => ({
                    stack: s.stack.filter(t => t.id !== id),
                    backlog: s.backlog.filter(t => t.id !== id),
                }));
            },

            // Settings
            updateSettings: (partial) => {
                set(s => ({ settings: { ...s.settings, ...partial } }));
            },

            // Data Export
            exportData: async () => {
                const { stack, backlog, history, settings } = get();
                const data = JSON.stringify({ stack, backlog, history, settings }, null, 2);
                const uri = FileSystem.documentDirectory + 'anchor_backup.json';
                await FileSystem.writeAsStringAsync(uri, data);
                await Sharing.shareAsync(uri);
            },

            exportCSV: async () => {
                const { history } = get();
                const header = 'Task,Created,Completed,Energy,Focus,Note\n';
                const rows = history.map(t => {
                    const created = new Date(t.createdAt).toISOString();
                    const completed = t.completedAt ? new Date(t.completedAt).toISOString() : '';
                    const energy = t.journal?.energy ?? '';
                    const focus = t.journal?.focus ?? '';
                    const note = (t.journal?.note ?? '').replace(/"/g, '""');
                    return `"${t.text.replace(/"/g, '""')}","${created}","${completed}","${energy}","${focus}","${note}"`;
                }).join('\n');
                const csv = header + rows;
                const uri = FileSystem.documentDirectory + 'anchor_history.csv';
                await FileSystem.writeAsStringAsync(uri, csv);
                await Sharing.shareAsync(uri);
            },

            importData: (json) => {
                try {
                    const data = JSON.parse(json);
                    set({
                        stack: data.stack ?? [],
                        backlog: data.backlog ?? [],
                        history: data.history ?? [],
                        settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
                    });
                } catch (e) {
                    console.error('Import failed:', e);
                }
            },
        }),
        {
            name: 'anchor-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
