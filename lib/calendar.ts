import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { useStore, Task } from '../store/useStore';

const CALENDAR_TITLE = 'Anchor Tasks';

async function getOrCreateCalendar(): Promise<string> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') throw new Error('Calendar permission not granted');

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const existing = calendars.find(c => c.title === CALENDAR_TITLE);
    if (existing) return existing.id;

    // Create a new calendar for Anchor
    const defaultSource =
        Platform.OS === 'android'
            ? { isLocalAccount: true, name: CALENDAR_TITLE, type: Calendar.SourceType?.LOCAL ?? 'LOCAL' }
            : calendars.find(c => c.source?.type === 'local')?.source ?? { name: 'default', type: 'local' };

    const calendarId = await Calendar.createCalendarAsync({
        title: CALENDAR_TITLE,
        color: '#4ADE80',
        entityType: Calendar.EntityTypes.EVENT,
        source: defaultSource as any,
        name: CALENDAR_TITLE,
        ownerAccount: 'anchor',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return calendarId;
}

export async function createCalendarEvent(task: Task, durationMinutes: number): Promise<string | null> {
    try {
        const calendarId = await getOrCreateCalendar();
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

        const eventId = await Calendar.createEventAsync(calendarId, {
            title: `⚓ ${task.text}`,
            startDate,
            endDate,
            notes: `Anchor task created at ${new Date(task.createdAt).toLocaleString()}`,
            alarms: [{ relativeOffset: 0 }],
        });

        return eventId;
    } catch (e) {
        console.error('Failed to create calendar event:', e);
        return null;
    }
}

export async function syncBacklogToCalendar(durationMinutes: number): Promise<number> {
    const { backlog } = useStore.getState();
    let synced = 0;
    for (const task of backlog) {
        const result = await createCalendarEvent(task, durationMinutes);
        if (result) synced++;
    }
    return synced;
}
