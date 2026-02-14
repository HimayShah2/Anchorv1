/**
 * Microsoft To Do Integration
 * Requires: npm install @react-native-community/msal @microsoft/microsoft-graph-client
 * 
 * NOTE: This is a placeholder implementation. Full OAuth requires:
 * 1. Azure AD app registration
 * 2. Client ID configuration
 * 3. Redirect URI setup
 */

import { useStore } from '../store/useStore';
import type { Task } from '../store/useStore';

// Placeholder - Replace with actual client ID from Azure AD
const MSAL_CONFIG = {
    clientId: 'YOUR_CLIENT_ID_HERE',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'msauth://com.anchor.ironclad/auth',
};

interface MicrosoftTask {
    id: string;
    title: string;
    status: 'notStarted' | 'inProgress' | 'completed';
    dueDateTime?: {
        dateTime: string;
        timeZone: string;
    };
    body?: {
        content: string;
    };
}

/**
 * Sign in with Microsoft account
 */
export const signInWithMicrosoft = async (): Promise<boolean> => {
    try {
        // Placeholder - actual implementation would use @react-native-community/msal
        console.log('Microsoft sign-in would happen here');
        console.log('Requires Azure AD app registration');

        // Simulated success
        return false; // Return false until configured
    } catch (error) {
        console.error('Microsoft sign-in error:', error);
        return false;
    }
};

/**
 * Sync task to Microsoft To Do
 */
export const syncTaskToMicrosoft = async (task: Task): Promise<void> => {
    try {
        if (!task) return;

        const microsoftTask: Partial<MicrosoftTask> = {
            title: task.text,
            status: task.type === 'DONE' ? 'completed' : 'notStarted',
        };

        if (task.deadline) {
            microsoftTask.dueDateTime = {
                dateTime: new Date(task.deadline).toISOString(),
                timeZone: 'UTC',
            };
        }

        if (task.journal?.note) {
            microsoftTask.body = {
                content: task.journal.note,
            };
        }

        // Placeholder - would use Microsoft Graph API
        console.log('Would sync to Microsoft To Do:', microsoftTask);

    } catch (error) {
        console.error('Microsoft sync error:', error);
    }
};

/**
 * Fetch tasks from Microsoft To Do
 */
export const fetchMicrosoftTasks = async (): Promise<Task[]> => {
    try {
        // Placeholder - would fetch from Microsoft Graph API
        console.log('Would fetch Microsoft To Do tasks');
        return [];
    } catch (error) {
        console.error('Microsoft fetch error:', error);
        return [];
    }
};

/**
 * Enable Microsoft To Do sync
 */
export const enableMicrosoftSync = async (): Promise<boolean> => {
    const signedIn = await signInWithMicrosoft();

    if (signedIn) {
        useStore.getState().updateSettings({ microsoftTodoSync: true });
        return true;
    }

    return false;
};

/**
 * Disable Microsoft To Do sync
 */
export const disableMicrosoftSync = async (): Promise<void> => {
    useStore.getState().updateSettings({ microsoftTodoSync: false });
    // Would revoke tokens here
};

// Export for documentation
export const SETUP_INSTRUCTIONS = `
Microsoft To Do Integration Setup:

1. Go to https://portal.azure.com
2. Azure Active Directory → App registrations → New registration
3. Name: "Anchor App"
4. Supported account types: Personal Microsoft accounts
5. Redirect URI: msauth://com.anchor.ironclad/auth
6. Copy Application (client) ID
7. Add permissions: Tasks.ReadWrite, User.Read
8. Install dependencies:
   npm install @react-native-community/msal
   npm install @microsoft/microsoft-graph-client
9. Replace MSAL_CONFIG.clientId with your client ID
10. Rebuild app with: npx expo prebuild && cd android && ./gradlew assembleDebug
`;
