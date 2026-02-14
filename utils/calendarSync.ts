import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';
import { useStore } from './useStore';

/**
 * Calendar Integration Module
 * Handles syncing tasks with device calendar
 */

// Request calendar permissions
export async function requestCalendarPermissions(): Promise<boolean> {
    try {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Calendar permission error:', error);
        return false;
    }
}

// Get or create Anchor calendar
export async function getAnchorCalendar(): Promise<string | null> {
    try {
        const hasPermission = await requestCalendarPermissions();
        if (!hasPermission) return null;

        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const anchorCal = calendars.find(cal => cal.title === 'Anchor Tasks');

        if (anchorCal) {
            return anchorCal.id;
        }

        // Create new calendar
        const defaultCalendarSource =
            Platform.OS === 'ios'
                ? await getDefaultCalendarSource()
                : { isLocalAccount: true, name: 'Anchor', type: Calendar.SourceType.LOCAL };

        if (!defaultCalendarSource) return null;

        const newCalendarId = await Calendar.createCalendarAsync({
            title: 'Anchor Tasks',
            color: '#10b981', // primary green
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.id,
            source: defaultCalendarSource,
            name: 'Anchor Tasks',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });

        return newCalendarId;
    } catch (error) {
        console.error('Get calendar error:', error);
        return null;
    }
}

// Get default calendar source (iOS)
async function getDefaultCalendarSource() {
    try {
        const sources = await Calendar.getSourcesAsync();
        const defaultSource = sources.find(
            source => source.type === Calendar.SourceType.LOCAL || source.type === Calendar.SourceType.CALDAV
        );
        return defaultSource || sources[0];
    } catch (error) {
        console.error('Get calendar source error:', error);
        return null;
    }
}

// Create calendar event for task with deadline
export async function createTaskEvent(taskId: string, taskText: string, deadline: number): Promise<string | null> {
    try {
        const calendarId = await getAnchorCalendar();
        if (!calendarId) return null;

        const eventDetails = {
            title: `⚓ ${taskText}`,
            startDate: new Date(deadline),
            endDate: new Date(deadline + 3600000), // 1 hour duration
            timeZone: 'GMT',
            notes: `Anchor Task ID: ${taskId}`,
            alarms: [{ relativeOffset: -60 }], // 1 hour before
        };

        const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
        return eventId;
    } catch (error) {
        console.error('Create event error:', error);
        return null;
    }
}

// Update calendar event
export async function updateTaskEvent(eventId: string, taskText: string, deadline: number): Promise<boolean> {
    try {
        await Calendar.updateEventAsync(eventId, {
            title: `⚓ ${taskText}`,
            startDate: new Date(deadline),
            endDate: new Date(deadline + 3600000),
        });
        return true;
    } catch (error) {
        console.error('Update event error:', error);
        return false;
    }
}

// Delete calendar event
export async function deleteTaskEvent(eventId: string): Promise<boolean> {
    try {
        await Calendar.deleteEventAsync(eventId);
        return true;
    } catch (error) {
        console.error('Delete event error:', error);
        return false;
    }
}

// Sync task with calendar (create/update/delete as needed)
export async function syncTaskToCalendar(
    taskId: string,
    taskText: string,
    deadline?: number,
    existingEventId?: string
): Promise<string | null> {
    try {
        // If task has no deadline, delete event if it exists
        if (!deadline) {
            if (existingEventId) {
                await deleteTaskEvent(existingEventId);
            }
            return null;
        }

        // If event exists, update it
        if (existingEventId) {
            const success = await updateTaskEvent(existingEventId, taskText, deadline);
            return success ? existingEventId : null;
        }

        // Otherwise, create new event
        return await createTaskEvent(taskId, taskText, deadline);
    } catch (error) {
        console.error('Sync task error:', error);
        return null;
    }
}
