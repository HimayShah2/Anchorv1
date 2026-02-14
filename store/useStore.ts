import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { writeAsStringAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// --- Types ---

export interface JournalEntry {
    energy: number;   // 1-5
    focus: number;    // 1-5
    note: string;
    mood?: string[];  // Mood tags (productive, distracted, etc.)
    prompt?: string;  // Journal prompt that was used
}

export interface Category {
    id: string;
    name: string;
    color: string; // Hex color
    icon?: string; // Emoji
}

export interface BrainNote {
    id: string;
    title: string;
    content: string; // Markdown text
    categories: string[]; // Category IDs
    linkedTasks: string[]; // Task IDs
    createdAt: number;
    updatedAt: number;
}

export interface Task {
    id: string;
    text: string;
    type: 'NOW' | 'LATER' | 'DONE';
    createdAt: number;
    completedAt?: number;
    journal?: JournalEntry;
    deadline?: number; // Optional deadline timestamp
    categories: string[]; // Category IDs
    linkedNotes: string[]; // BrainNote IDs
    calendarEventId?: string; // Calendar event ID if synced
}

export interface Settings {
    timerMinutes: number;
    timerDuration: number; // Custom timer duration
    hapticStrength: 'off' | 'light' | 'medium' | 'heavy';
    notifyOnComplete: boolean;
    dailyReminderHour: number | null;
    theme: 'light' | 'dark';
    calendarSync: boolean; // Sync tasks with device calendar
    autoDND: boolean; // Auto-enable Do Not Disturb when task starts
    fontSize: 'small' | 'medium' | 'large' | 'xlarge'; // Accessibility font size
    highContrast: boolean; // High contrast mode for accessibility
    reduceAnimations: boolean; // Reduce animations for accessibility
    microsoftTodoSync: boolean; // Sync with Microsoft To Do
}

interface AppState {
    // Data
    stack: Task[];
    backlog: Task[];
    history: Task[];
    brainNotes: BrainNote[];
    categories: Category[];
    timerStart: number | null;
    pendingJournalTaskId: string | null;
    settings: Settings;
    currentEnergy: number;
    hyperfocusMode: boolean;
    hyperfocusStartTime: number | null;
    undoStack: Array<{ action: string; data: any }>; // Last 5 actions

    // Stack Actions
    addTask: (text: string, isNow: boolean, deadline?: number, categories?: string[]) => void;
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
    setTaskDeadline: (id: string, deadline: number | null) => void;
    setTaskCategories: (id: string, categories: string[]) => void;
    linkTaskToNote: (taskId: string, noteId: string) => void;

    // Brain Notes
    addNote: (title: string, content: string, categories?: string[]) => void;
    updateNote: (id: string, updates: Partial<Omit<BrainNote, 'id' | 'createdAt'>>) => void;
    deleteNote: (id: string) => void;

    // Categories
    addCategory: (name: string, color: string, icon?: string) => void;
    updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
    deleteCategory: (id: string) => void;

    // Settings
    updateSettings: (partial: Partial<Settings>) => void;

    // Data Management
    exportData: () => Promise<void>;
    exportCSV: () => Promise<void>;
    exportMarkdown: () => Promise<void>;
    importData: (json: string) => void;
}

const DEFAULT_SETTINGS: Settings = {
    timerMinutes: 25,
    timerDuration: 25,
    theme: 'dark',
    hapticStrength: 'medium',
    notifyOnComplete: true,
    dailyReminderHour: 9,
    calendarSync: false,
    autoDND: false,
    fontSize: 'medium',
    highContrast: false,
    reduceAnimations: false,
    microsoftTodoSync: false,
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
            brainNotes: [],
            categories: [],
            timerStart: null,
            pendingJournalTaskId: null,
            settings: DEFAULT_SETTINGS,
            currentEnergy: 3,
            hyperfocusMode: false,
            hyperfocusStartTime: null,
            undoStack: [],

            addTask: (text, isNow, deadline, categories = []) => {
                doHaptic(get().settings.hapticStrength);
                const task: Task = {
                    id: Date.now().toString(),
                    text,
                    type: isNow ? 'NOW' : 'LATER',
                    createdAt: Date.now(),
                    categories,
                    linkedNotes: [],
                    ...(deadline && { deadline }),
                };

                // Trigger DND if autoDND is enabled and this is an anchor task
                if (isNow && get().settings.autoDND) {
                    import('../utils/dndManager').then(({ enableDND }) => {
                        enableDND();
                    });
                }

                // Start timer notification if this is an anchor task
                if (isNow) {
                    const timerDuration = get().settings.timerDuration || 25;
                    import('../utils/timerNotification').then(({ startTimerNotification }) => {
                        startTimerNotification(text, timerDuration);
                    });
                    // Update widget with new task
                    import('../utils/widgetManager').then(({ updateWidget }) => {
                        updateWidget(text, timerDuration * 60 * 1000);
                    });
                    // Update Now Bar (One UI 8)
                    import('../utils/nowBarManager').then(({ updateNowBar }) => {
                        updateNowBar(text, timerDuration * 60 * 1000);
                    });
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

                // Disable DND if enabled
                if (get().settings.autoDND) {
                    import('../utils/dndManager').then(({ disableDND }) => {
                        disableDND();
                    });
                }

                // Stop timer notification
                import('../utils/timerNotification').then(({ stopTimerNotification }) => {
                    stopTimerNotification();
                });

                set({
                    stack: rest,
                    history: [completed, ...get().history],
                    timerStart: rest.length > 0 ? Date.now() : null,
                    pendingJournalTaskId: completed.id,
                });

                // Start new timer if there's another task
                if (rest.length > 0) {
                    const timerDuration = get().settings.timerDuration || 25;
                    import('../utils/timerNotification').then(({ startTimerNotification }) => {
                        startTimerNotification(rest[0].text, timerDuration);
                    });
                    // Update widget with next task
                    import('../utils/widgetManager').then(({ updateWidget }) => {
                        updateWidget(rest[0].text, timerDuration * 60 * 1000);
                    });
                } else {
                    // Clear widget if no more tasks
                    import('../utils/widgetManager').then(({ clearWidget }) => {
                        clearWidget();
                    });
                }
            },

            deferTop: () => {
                const { stack, backlog } = get();
                if (stack.length === 0) return;
                const [deferred, ...rest] = stack;

                // Disable DND if enabled
                if (get().settings.autoDND) {
                    import('../utils/dndManager').then(({ disableDND }) => {
                        disableDND();
                    });
                }

                // Stop timer notification
                import('../utils/timerNotification').then(({ stopTimerNotification }) => {
                    stopTimerNotification();
                });

                set({
                    stack: rest,
                    backlog: [...backlog, { ...deferred, type: 'LATER' }],
                    timerStart: rest.length > 0 ? Date.now() : null,
                });

                // Start new timer if there's another task
                if (rest.length > 0) {
                    const timerDuration = get().settings.timerDuration || 25;
                    import('../utils/timerNotification').then(({ startTimerNotification }) => {
                        startTimerNotification(rest[0].text, timerDuration);
                    });
                    // Update widget with next task
                    import('../utils/widgetManager').then(({ updateWidget }) => {
                        updateWidget(rest[0].text, timerDuration * 60 * 1000);
                    });
                } else {
                    // Clear widget if no more tasks
                    import('../utils/widgetManager').then(({ clearWidget }) => {
                        clearWidget();
                    });
                }
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

            setTaskDeadline: (id, deadline) => {
                set(s => ({
                    stack: s.stack.map(t => t.id === id ? { ...t, deadline: deadline ?? undefined } : t),
                    backlog: s.backlog.map(t => t.id === id ? { ...t, deadline: deadline ?? undefined } : t),
                }));
            },

            setTaskCategories: (id, categories) => {
                set(s => ({
                    stack: s.stack.map(t => t.id === id ? { ...t, categories } : t),
                    backlog: s.backlog.map(t => t.id === id ? { ...t, categories } : t),
                }));
            },

            linkTaskToNote: (taskId, noteId) => {
                set(s => ({
                    stack: s.stack.map(t => t.id === taskId ? { ...t, linkedNotes: [...t.linkedNotes, noteId] } : t),
                    backlog: s.backlog.map(t => t.id === taskId ? { ...t, linkedNotes: [...t.linkedNotes, noteId] } : t),
                    history: s.history.map(t => t.id === taskId ? { ...t, linkedNotes: [...t.linkedNotes, noteId] } : t),
                }));
            },

            // Brain Notes
            addNote: (title, content, categories = []) => {
                const note: BrainNote = {
                    id: Date.now().toString(),
                    title,
                    content,
                    categories,
                    linkedTasks: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                set(s => ({ brainNotes: [...s.brainNotes, note] }));
            },

            updateNote: (id, updates) => {
                set(s => ({
                    brainNotes: s.brainNotes.map(n =>
                        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
                    ),
                }));
            },

            deleteNote: (id) => {
                set(s => ({ brainNotes: s.brainNotes.filter(n => n.id !== id) }));
            },

            // Categories
            addCategory: (name, color, icon) => {
                const category: Category = {
                    id: Date.now().toString(),
                    name,
                    color,
                    ...(icon && { icon }),
                };
                set(s => ({ categories: [...s.categories, category] }));
            },

            updateCategory: (id, updates) => {
                set(s => ({
                    categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c),
                }));
            },

            deleteCategory: (id) => {
                set(s => ({ categories: s.categories.filter(c => c.id !== id) }));
            },

            // Settings
            updateSettings: (partial) => {
                set(s => ({ settings: { ...s.settings, ...partial } }));
            },

            // Data Export
            exportData: async () => {
                const { stack, backlog, history, settings } = get();
                const data = JSON.stringify({ stack, backlog, history, settings }, null, 2);
                const uri = documentDirectory + 'anchor_backup.json';
                await writeAsStringAsync(uri, data);
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
                const uri = documentDirectory + 'anchor_history.csv';
                await writeAsStringAsync(uri, csv);
                await Sharing.shareAsync(uri);
            },

            exportMarkdown: async () => {
                const { history } = get();
                const now = new Date();
                const filename = `anchor_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.md`;

                // YAML frontmatter
                let markdown = `---\n`;
                markdown += `title: Anchor Task Export\n`;
                markdown += `date: ${now.toISOString()}\n`;
                markdown += `total_tasks: ${history.length}\n`;
                markdown += `app_version: "4.0 Ironclad"\n`;
                markdown += `---\n\n`;
                markdown += `# Anchor Task History\n\n`;

                // Group tasks by date
                const tasksByDate = new Map<string, typeof history>();
                history.forEach(task => {
                    if (task.completedAt) {
                        const date = new Date(task.completedAt);
                        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        if (!tasksByDate.has(dateKey)) {
                            tasksByDate.set(dateKey, []);
                        }
                        tasksByDate.get(dateKey)!.push(task);
                    }
                });

                // Sort dates (newest first)
                const sortedDates = Array.from(tasksByDate.keys()).sort((a, b) => b.localeCompare(a));

                // Write each day's tasks
                sortedDates.forEach(dateKey => {
                    const tasks = tasksByDate.get(dateKey)!;
                    const date = new Date(dateKey);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                    markdown += `## ${dayName}\n\n`;

                    tasks.forEach(task => {
                        const time = task.completedAt ? new Date(task.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

                        // Task checkbox
                        markdown += `- [x] ${task.text}`;

                        // Add time
                        if (time) {
                            markdown += ` ⏰${time}`;
                        }

                        // Add energy/focus tags
                        if (task.journal) {
                            markdown += ` #energy-${task.journal.energy} #focus-${task.journal.focus}`;
                        }

                        markdown += `\n`;

                        // Add journal note if present
                        if (task.journal?.note) {
                            markdown += `  - 📝 *${task.journal.note}*\n`;
                        }
                    });

                    markdown += `\n`;
                });

                // Summary stats
                const journaledCount = history.filter(t => t.journal).length;
                const avgEnergy = journaledCount > 0
                    ? (history.reduce((s, t) => s + (t.journal?.energy ?? 0), 0) / journaledCount).toFixed(1)
                    : '0';
                const avgFocus = journaledCount > 0
                    ? (history.reduce((s, t) => s + (t.journal?.focus ?? 0), 0) / journaledCount).toFixed(1)
                    : '0';

                markdown += `---\n\n`;
                markdown += `## Summary\n\n`;
                markdown += `- **Total Completed Tasks**: ${history.length}\n`;
                markdown += `- **Tasks with Journal Entries**: ${journaledCount}\n`;
                markdown += `- **Average Energy Level**: ${avgEnergy}/5\n`;
                markdown += `- **Average Focus Quality**: ${avgFocus}/5\n`;
                markdown += `\n---\n`;
                markdown += `\n*Exported from Anchor - Built for minds that work differently* 🎯`;

                // Write and share
                const uri = documentDirectory + filename;
                await writeAsStringAsync(uri, markdown);
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
