# Verification and Testing Plan

## Overview
This document outlines the comprehensive testing strategy for Phase 3 features including DND integration, enhanced journaling, and accessibility improvements.

---

## Automated Tests

### DND Permission Flow (Jest + Mock)

**File**: `__tests__/dndPermissions.test.ts`

```typescript
import { requestDNDPermissions, enableDND, disableDND } from '../utils/dndManager';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications');

describe('DND Permission Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should request permissions correctly', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
            status: 'granted',
            canAskAgain: true,
        });

        const result = await requestDNDPermissions();
        expect(result).toBe(true);
        expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });

    test('should return false if permission denied', async () => {
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
            status: 'denied',
            canAskAgain: false,
        });

        const result = await requestDNDPermissions();
        expect(result).toBe(false);
    });

    test('should enable DND mode', async () => {
        (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue({});
        
        await enableDND();
        
        expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
            'default',
            expect.objectContaining({
                importance: 0, // No sound/vibration
            })
        );
    });

    test('should restore DND mode', async () => {
        await disableDND();
        
        expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
            'default',
            expect.objectContaining({
                importance: 3, // Normal
            })
        );
    });
});
```

---

### Journal Prompts Logic

**File**: `__tests__/journalPrompts.test.ts`

```typescript
import { getContextualPrompt, JOURNAL_PROMPTS, MOOD_TAGS } from '../constants/journalPrompts';

describe('Journal Prompts', () => {
    test('should return a prompt', () => {
        const prompt = getContextualPrompt();
        expect(prompt).toBeDefined();
        expect(JOURNAL_PROMPTS).toContainEqual(prompt);
    });

    test('should return different prompts for different times', () => {
        // Mock morning
        const mockDate = new Date('2026-01-01T08:00:00');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
        
        const morningPrompt = getContextualPrompt();
        expect(morningPrompt.category).toBe('planning');

        jest.restoreAllMocks();
    });

    test('should have all mood tags', () => {
        expect(MOOD_TAGS).toHaveLength(10);
        expect(MOOD_TAGS.every(tag => tag.id && tag.label && tag.color)).toBe(true);
    });
});
```

---

### Accessibility Settings Persistence

**File**: `__tests__/accessibilitySettings.test.ts`

```typescript
import { useStore } from '../store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('Accessibility Settings Persistence', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    test('should persist font size setting', async () => {
        const { updateSettings, settings } = useStore.getState();
        
        updateSettings({ fontSize: 'large' });
        
        // Wait for persistence
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(settings.fontSize).toBe('large');
    });

    test('should persist high contrast setting', async () => {
        const { updateSettings, settings } = useStore.getState();
        
        updateSettings({ highContrast: true });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(settings.highContrast).toBe(true);
    });

    test('should load persisted settings on init', async () => {
        // Mock AsyncStorage data
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
            JSON.stringify({
                settings: {
                    fontSize: 'xlarge',
                    highContrast: true,
                    reduceAnimations: true,
                },
            })
        );

        // Reinitialize store
        const state = useStore.getState();
        
        expect(state.settings.fontSize).toBe('xlarge');
        expect(state.settings.highContrast).toBe(true);
        expect(state.settings.reduceAnimations).toBe(true);
    });
});
```

---

## Manual Verification

### DND Integration

**Test Steps**:

1. **Enable Auto-DND**:
   - [ ] Navigate to Settings
   - [ ] Toggle "Auto Do Not Disturb" ON
   - [ ] Verify permission request appears
   - [ ] Grant permission
   - [ ] Verify toggle remains ON

2. **Task Start Triggers DND**:
   - [ ] Create a "NOW" task from home screen
   - [ ] Verify phone enters DND mode (notification suppression)
   - [ ] Check notification panel - should show "Do Not Disturb ON"

3. **Task Complete Restores DND**:
   - [ ] Complete the active task
   - [ ] Verify DND mode is disabled
   - [ ] Check notification panel - should be back to normal

4. **Task Defer Restores DND**:
   - [ ] Start a new task
   - [ ] Defer the task to backlog
   - [ ] Verify DND is restored

5. **Permission Denial Flow**:
   - [ ] Disable auto-DND
   - [ ] Re-enable and DENY permission
   - [ ] Verify alert dialog shows
   - [ ] Verify toggle stays OFF

---

### Enhanced Journaling

**Test Steps**:

1. **Complete Task → See Journal Modal**:
   - [ ] Start and complete a task
   - [ ] Verify journal modal appears
   - [ ] Verify 6 mood tag buttons displayed

2. **Add Mood Tags**:
   - [ ] Tap "🚀 Productive"
   - [ ] Verify button highlights
   - [ ] Tap "🎯 Focused"
   - [ ] Verify both buttons highlighted
   - [ ] Tap "🚀 Productive" again
   - [ ] Verify it deselects

3. **Journal Entry Fields**:
   - [ ] Adjust energy slider (1-5)
   - [ ] Adjust focus slider (1-5)
   - [ ] Enter note text
   - [ ] Tap "Save"
   - [ ] Verify modal closes

4. **Journal Data Persistence**:
   - [ ] Navigate to History
   - [ ] Find completed task
   - [ ] Verify journal entry shows:
     - Energy/Focus scores
     - Note text
     - Mood tags (if implemented in UI)

5. **Skip Journal**:
   - [ ] Complete another task
   - [ ] Tap "Skip" in journal modal
   - [ ] Verify task saved without journal data

---

### Accessibility

**Test Steps**:

1. **Navigate to Accessibility Page**:
   - [ ] Open Settings
   - [ ] Tap "♿ Accessibility"
   - [ ] Verify page loads

2. **Font Size Adjustment**:
   - [ ] Select "Small"
   - [ ] Navigate back to home - verify text is smaller
   - [ ] Return to Accessibility
   - [ ] Select "X-Large"
   - [ ] Navigate back - verify text is larger

3. **High Contrast Mode**:
   - [ ] Enable "High Contrast Mode"
   - [ ] Verify colors have higher contrast
   - [ ] Check borders are thicker/more visible
   - [ ] Navigate through app - verify consistent colors

4. **Reduce Animations**:
   - [ ] Enable "Reduce Animations"
   - [ ] Navigate between pages
   - [ ] Verify transitions are faster/simpler
   - [ ] Disable toggle
   - [ ] Verify animations return

5. **Screen Reader (TalkBack on Android)**:
   - [ ] Enable TalkBack in device settings
   - [ ] Navigate Anchor app
   - [ ] Verify all buttons have descriptive labels
   - [ ] Verify navigation order is logical
   - [ ] Test form inputs announce correctly

6. **Touch Targets**:
   - [ ] Visually inspect all buttons
   - [ ] Verify minimum 48x48dp size
   - [ ] Test with one finger - all should be tappable

---

## Export Button Verification

**Test Steps**:

1. **JSON Export**:
   - [ ] Navigate to Settings
   - [ ] Tap "💾 Backup JSON"
   - [ ] Verify share dialog opens
   - [ ] Save file and verify JSON structure

2. **CSV Export**:
   - [ ] Tap "📄 Export CSV"
   - [ ] Verify share dialog opens
   - [ ] Open CSV - verify columns (Task, Created, Completed, Energy, Focus, Note)

3. **Markdown Export**:
   - [ ] Tap "📝 Export Markdown (Obsidian)"
   - [ ] Verify share dialog opens
   - [ ] Open .md file in editor
   - [ ] Verify formatting:
     - Daily note structure
     - Task checkboxes
     - Tags
     - Journal entries

---

## Performance Testing

**Test Steps**:

1. **Large History (100+ tasks)**:
   - [ ] Import or create 100+ tasks
   - [ ] Navigate to History
   - [ ] Verify scroll performance
   - [ ] Search history - verify instant results

2. **DND Rapid Toggle**:
   - [ ] Quickly start/complete 5 tasks
   - [ ] Verify DND toggles correctly each time
   - [ ] Check for memory leaks

3. **Font Size Changes**:
   - [ ] Rapidly switch between font sizes
   - [ ] Verify UI reflows correctly
   - [ ] Check for layout breaks

---

## Regression Testing

**Checklist**:

- [ ] Timer still works on home screen
- [ ] Tasks can be created (NOW/LATER)
- [ ] Tasks can be completed
- [ ] Tasks can be deferred
- [ ] Categories work correctly
- [ ] Notes can be created/edited
- [ ] Settings persist after app restart
- [ ] Navigation works (all pages accessible)

---

## Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- dndPermissions.test.ts

# Watch mode
npm test -- --watch
```

---

## Test Data Setup

**Create test scenarios**:

```typescript
// utils/testData.ts
export const createTestTasks = () => {
    const store = useStore.getState();
    
    // Create 10 completed tasks with journals
    for (let i = 0; i < 10; i++) {
        store.addTask(`Test task ${i}`, true);
        store.completeTop();
        store.logJournal(
            store.history[0].id,
            {
                energy: Math.floor(Math.random() * 5) + 1,
                focus: Math.floor(Math.random() * 5) + 1,
                note: `Test note ${i}`,
                mood: ['productive'],
            }
        );
    }
};
```

---

## Acceptance Criteria

### DND Integration
- ✅ Permission request triggers on first enable
- ✅ DND activates when task starts
- ✅ DND deactivates when task completes/defers
- ✅ Works correctly on Android 12+

### Enhanced Journaling
- ✅ Modal appears after task completion
- ✅ Mood tags selectable (multi-select)
- ✅ Journal data persists to history
- ✅ Skip button works

### Accessibility
- ✅ 4 font sizes work
- ✅ High contrast colors apply
- ✅ Reduce animations functional
- ✅ Screen reader compatible
- ✅ All buttons min 48dp

### Export Functions
- ✅ JSON export works
- ✅ CSV export works
- ✅ Markdown export works
- ✅ Share dialog appears for all

---

## Bug Reporting Template

```markdown
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots**: (if applicable)

**Device Info**:
- Device: 
- Android Version:
- App Version:
```

---

## Test Completion

**Sign-off**:

- [ ] All automated tests pass
- [ ] Manual verification checklist complete
- [ ] Performance acceptable
- [ ] No regressions found
- [ ] Ready for production
