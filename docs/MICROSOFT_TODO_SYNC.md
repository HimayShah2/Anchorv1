# Microsoft To Do Integration Guide

## Overview
Integrate Anchor app with Microsoft To Do for bidirectional task synchronization using Microsoft Graph API.

## Prerequisites
- Azure AD App Registration
- Microsoft 365 account (or free Microsoft account)
- OAuth 2.0 authentication flow
- Expo SecureStore for token storage

---

## 1. Azure App Registration

### Create App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: Anchor App
   - **Supported account types**: Personal Microsoft accounts
   - **Redirect URI**: `msauth://com.anchor.app/auth` (for mobile)

### Configure Permissions
Add Microsoft Graph API permissions:
- `Tasks.ReadWrite` - Read and write user tasks
- `User.Read` - Sign in and read user profile
- `offline_access` - Maintain access to data

### Get Credentials
Note down:
- **Application (client) ID**: `your-client-id`
- **Directory (tenant) ID**: `your-tenant-id`

---

## 2. Install Dependencies

```bash
npm install @react-native-community/msal
npm install @microsoft/microsoft-graph-client
npm install expo-secure-store
```

---

## 3. Implement OAuth Authentication

**File**: `utils/microsoftAuth.ts`

```typescript
import { PublicClientApplication } from '@react-native-community/msal';
import * as SecureStore from 'expo-secure-store';

const msalConfig = {
    auth: {
        clientId: 'YOUR_CLIENT_ID',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: 'msauth://com.anchor.app/auth',
    },
};

const pca = new PublicClientApplication(msalConfig);

export const signInWithMicrosoft = async () => {
    try {
        const result = await pca.acquireToken({
            scopes: ['Tasks.ReadWrite', 'User.Read', 'offline_access'],
        });
        
        // Store access token securely
        await SecureStore.setItemAsync('ms_access_token', result.accessToken);
        await SecureStore.setItemAsync('ms_refresh_token', result.refreshToken || '');
        
        return result;
    } catch (error) {
        console.error('Microsoft sign-in error:', error);
        throw error;
    }
};

export const getAccessToken = async () => {
    try {
        // Try to get cached token
        const token = await SecureStore.getItemAsync('ms_access_token');
        
        if (!token) {
            // Silent token acquisition
            const result = await pca.acquireTokenSilent({
                scopes: ['Tasks.ReadWrite'],
            });
            await SecureStore.setItemAsync('ms_access_token', result.accessToken);
            return result.accessToken;
        }
        
        return token;
    } catch (error) {
        // Token expired, need to re-authenticate
        return null;
    }
};

export const signOut = async () => {
    await pca.signOut();
    await SecureStore.deleteItemAsync('ms_access_token');
    await SecureStore.deleteItemAsync('ms_refresh_token');
};
```

---

## 4. Microsoft Graph API Client

**File**: `utils/microsoftTodoSync.ts`

```typescript
import { Client } from '@microsoft/microsoft-graph-client';
import { getAccessToken } from './microsoftAuth';
import type { Task } from '../store/useStore';

const getGraphClient = async () => {
    const token = await getAccessToken();
    
    return Client.init({
        authProvider: (done) => {
            done(null, token);
        },
    });
};

// Get default task list
export const getDefaultTaskList = async () => {
    const client = await getGraphClient();
    const lists = await client.api('/me/todo/lists').get();
    
    // Find or create "Anchor Tasks" list
    let anchorList = lists.value.find((list: any) => list.displayName === 'Anchor Tasks');
    
    if (!anchorList) {
        anchorList = await client.api('/me/todo/lists').post({
            displayName: 'Anchor Tasks',
        });
    }
    
    return anchorList.id;
};

// Create task in Microsoft To Do
export const createMicrosoftTask = async (task: Task, listId: string) => {
    const client = await getGraphClient();
    
    const msTask = {
        title: task.text,
        status: 'notStarted',
        importance: 'normal',
        ...(task.deadline && {
            dueDateTime: {
                dateTime: new Date(task.deadline).toISOString(),
                timeZone: 'UTC',
            },
        }),
        body: {
            content: task.journal?.note || '',
            contentType: 'text',
        },
    };
    
    const created = await client.api(`/me/todo/lists/${listId}/tasks`).post(msTask);
    
    return created.id; // Store this in task.microsoftTaskId
};

// Update Microsoft To Do task
export const updateMicrosoftTask = async (taskId: string, listId: string, updates: Partial<Task>) => {
    const client = await getGraphClient();
    
    const msTask: any = {};
    
    if (updates.text) {
        msTask.title = updates.text;
    }
    
    if (updates.completedAt) {
        msTask.status = 'completed';
        msTask.completedDateTime = {
            dateTime: new Date(updates.completedAt).toISOString(),
            timeZone: 'UTC',
        };
    }
    
    await client.api(`/me/todo/lists/${listId}/tasks/${taskId}`).patch(msTask);
};

// Delete Microsoft To Do task
export const deleteMicrosoftTask = async (taskId: string, listId: string) => {
    const client = await getGraphClient();
    await client.api(`/me/todo/lists/${listId}/tasks/${taskId}`).delete();
};

// Sync from Microsoft To Do to Anchor
export const syncFromMicrosoft = async (listId: string) => {
    const client = await getGraphClient();
    const response = await client.api(`/me/todo/lists/${listId}/tasks`).get();
    
    const tasks = response.value.map((msTask: any) => ({
        id: msTask.id,
        text: msTask.title,
        completed: msTask.status === 'completed',
        deadline: msTask.dueDateTime?.dateTime ? new Date(msTask.dueDateTime.dateTime).getTime() : null,
    }));
    
    return tasks;
};
```

---

## 5. Conflict Resolution Strategy

**File**: `utils/syncConflictResolver.ts`

```typescript
export type SyncConflict = {
    anchorTask: Task;
    microsoftTask: any;
    conflictType: 'both_modified' | 'deleted_locally' | 'deleted_remotely';
};

export const resolveConflict = (conflict: SyncConflict): 'use_local' | 'use_remote' | 'merge' => {
    const { anchorTask, microsoftTask, conflictType } = conflict;
    
    // Strategy 1: Last write wins
    const anchorModified = anchorTask.completedAt || anchorTask.createdAt;
    const msModified = new Date(microsoftTask.lastModifiedDateTime).getTime();
    
    if (conflictType === 'both_modified') {
        return anchorModified > msModified ? 'use_local' : 'use_remote';
    }
    
    // Strategy 2: Prefer completion
    if (anchorTask.completedAt && microsoftTask.status !== 'completed') {
        return 'use_local';
    }
    
    if (microsoftTask.status === 'completed' && !anchorTask.completedAt) {
        return 'use_remote';
    }
    
    // Default: merge
    return 'merge';
};

export const mergeTask = (anchorTask: Task, microsoftTask: any): Task => {
    return {
        ...anchorTask,
        text: microsoftTask.title || anchorTask.text,
        completedAt: microsoftTask.status === 'completed' 
            ? new Date(microsoftTask.completedDateTime.dateTime).getTime()
            : anchorTask.completedAt,
        deadline: microsoftTask.dueDateTime?.dateTime
            ? new Date(microsoftTask.dueDateTime.dateTime).getTime()
            : anchorTask.deadline,
    };
};
```

---

## 6. Offline Queue Mechanism

**File**: `utils/syncQueue.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

type SyncAction = {
    id: string;
    type: 'create' | 'update' | 'delete';
    task: Task;
    timestamp: number;
};

const QUEUE_KEY = 'ms_sync_queue';

export const addToSyncQueue = async (action: SyncAction) => {
    const queue = await getSyncQueue();
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getSyncQueue = async (): Promise<SyncAction[]> => {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
};

export const processSyncQueue = async (listId: string) => {
    const queue = await getSyncQueue();
    
    for (const action of queue) {
        try {
            switch (action.type) {
                case 'create':
                    await createMicrosoftTask(action.task, listId);
                    break;
                case 'update':
                    await updateMicrosoftTask(action.task.microsoftTaskId!, listId, action.task);
                    break;
                case 'delete':
                    await deleteMicrosoftTask(action.task.microsoftTaskId!, listId);
                    break;
            }
            
            // Remove from queue after successful sync
            queue.shift();
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('Sync queue processing error:', error);
            break; // Stop processing on error
        }
    }
};
```

---

## 7. Settings UI Integration

**File**: `app/settings.tsx`

Add Microsoft To Do toggle:

```typescript
<Pressable
    onPress={async () => {
        if (!settings.microsoftTodoSync) {
            const result = await signInWithMicrosoft();
            if (result) {
                updateSettings({ microsoftTodoSync: true });
                const listId = await getDefaultTaskList();
                await AsyncStorage.setItem('ms_list_id', listId);
            }
        } else {
            await signOut();
            updateSettings({ microsoftTodoSync: false });
        }
    }}
    className="bg-surface p-4 rounded-2xl border border-dim mb-3"
>
    <View className="flex-row items-center justify-between">
        <View>
            <Text className="text-white text-base font-bold">📋 Microsoft To Do Sync</Text>
            <Text className="text-gray-500 text-xs">Bidirectional task synchronization</Text>
        </View>
        <View className={`w-12 h-6 rounded-full ${settings.microsoftTodoSync ? 'bg-primary' : 'bg-dim'}`}>
            <View className={`w-4 h-4 rounded-full bg-white ${settings.microsoftTodoSync ? 'ml-auto' : ''}`} />
        </View>
    </View>
</Pressable>
```

---

## 8. Automated Sync

**File**: `utils/backgroundSync.ts`

```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SYNC_TASK = 'ms-todo-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        const listId = await AsyncStorage.getItem('ms_list_id');
        if (listId) {
            await processSyncQueue(listId);
            await syncFromMicrosoft(listId);
        }
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerBackgroundSync = async () => {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
    });
};
```

---

## Testing

### Manual Test Flow
1. Sign in with Microsoft account
2. Create task in Anchor → verify it appears in Microsoft To Do
3. Complete task in Microsoft To Do → verify it syncs to Anchor
4. Go offline → create task → go online → verify sync queue processes
5. Modify same task on both sides → verify conflict resolution

---

## Resources
- [Microsoft Graph API Docs](https://docs.microsoft.com/en-us/graph/api/overview)
- [Authentication Flow](https://docs.microsoft.com/en-us/graph/auth-overview)
- [To Do API Reference](https://docs.microsoft.com/en-us/graph/api/resources/todo-overview)
