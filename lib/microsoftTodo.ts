import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore, Task } from '../store/useStore';

// --- Configuration ---
// User must set their Azure AD Client ID here after registering an app at:
// https://portal.azure.com → Azure Active Directory → App registrations
const CLIENT_ID = '__YOUR_AZURE_CLIENT_ID__';
const TENANT_ID = 'common'; // 'common' allows any Microsoft account
const SCOPES = ['Tasks.ReadWrite', 'User.Read'];

const DISCOVERY = {
    authorizationEndpoint: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
};

const TOKEN_KEY = 'anchor_ms_token';
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

WebBrowser.maybeCompleteAuthSession();

// --- Auth ---

export function useAzureAuth() {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'anchor' });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            scopes: SCOPES,
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            usePKCE: true,
        },
        DISCOVERY
    );

    return { request, response, promptAsync, redirectUri };
}

export async function exchangeCodeForToken(code: string, redirectUri: string, codeVerifier?: string): Promise<string | null> {
    try {
        const result = await AuthSession.exchangeCodeAsync(
            {
                clientId: CLIENT_ID,
                code,
                redirectUri,
                extraParams: codeVerifier ? { code_verifier: codeVerifier } : undefined,
            },
            DISCOVERY
        );
        if (result.accessToken) {
            await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
            return result.accessToken;
        }
        return null;
    } catch (e) {
        console.error('Token exchange failed:', e);
        return null;
    }
}

export async function getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
}

// --- Graph API ---

async function graphFetch(path: string, options: RequestInit = {}) {
    const token = await getStoredToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${GRAPH_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Graph API error ${res.status}: ${text}`);
    }
    return res.json();
}

// --- To Do Operations ---

export async function getTaskLists(): Promise<any[]> {
    const data = await graphFetch('/me/todo/lists');
    return data.value ?? [];
}

export async function getOrCreateAnchorList(): Promise<string> {
    const lists = await getTaskLists();
    const anchor = lists.find((l: any) => l.displayName === 'Anchor');
    if (anchor) return anchor.id;

    const created = await graphFetch('/me/todo/lists', {
        method: 'POST',
        body: JSON.stringify({ displayName: 'Anchor' }),
    });
    return created.id;
}

export async function getTasks(listId: string): Promise<any[]> {
    const data = await graphFetch(`/me/todo/lists/${listId}/tasks`);
    return data.value ?? [];
}

export async function createMSTodoTask(listId: string, title: string): Promise<any> {
    return graphFetch(`/me/todo/lists/${listId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title, importance: 'normal' }),
    });
}

export async function completeMSTodoTask(listId: string, taskId: string): Promise<any> {
    return graphFetch(`/me/todo/lists/${listId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
    });
}

// --- Sync Logic ---

export async function syncToMSTodo(): Promise<{ synced: number; errors: number }> {
    const { backlog, stack } = useStore.getState();
    const allTasks = [...stack, ...backlog];
    let synced = 0;
    let errors = 0;

    try {
        const listId = await getOrCreateAnchorList();
        const existing = await getTasks(listId);
        const existingTitles = new Set(existing.map((t: any) => t.title));

        for (const task of allTasks) {
            if (!existingTitles.has(task.text)) {
                try {
                    await createMSTodoTask(listId, task.text);
                    synced++;
                } catch {
                    errors++;
                }
            }
        }
    } catch (e) {
        console.error('MS To Do sync failed:', e);
        errors = allTasks.length;
    }

    return { synced, errors };
}

export async function importFromMSTodo(): Promise<number> {
    const { addTask } = useStore.getState();
    let imported = 0;

    try {
        const listId = await getOrCreateAnchorList();
        const tasks = await getTasks(listId);
        const { backlog, stack } = useStore.getState();
        const localTexts = new Set([...stack, ...backlog].map(t => t.text));

        for (const t of tasks) {
            if (t.status !== 'completed' && !localTexts.has(t.title)) {
                addTask(t.title, false);
                imported++;
            }
        }
    } catch (e) {
        console.error('MS To Do import failed:', e);
    }

    return imported;
}
