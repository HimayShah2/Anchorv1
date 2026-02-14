# Samsung One UI 8 Integration Guide

## Overview
Samsung One UI 8 (based on Android 16) offers advanced features for enhanced user experience. This guide documents implementation requirements for Anchor app.

## Features to Implement

### 1. Material You Dynamic Theming

**Description**: Auto-generate app colors from user's wallpaper.

**Implementation**:
```kotlin
// In MainActivity.kt or theme setup
import android.os.Build
import androidx.core.content.ContextCompat

if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    // Enable dynamic color
    setTheme(R.style.Theme_Anchor_DynamicColor)
}
```

**styles.xml**:
```xml
<style name="Theme.Anchor.DynamicColor" parent="Theme.MaterialComponents.DayNight.NoActionBar">
    <item name="colorPrimary">@android:color/system_accent1_500</item>
    <item name="colorSecondary">@android:color/system_accent2_500</item>
    <item name="colorTertiary">@android:color/system_accent3_500</item>
</style>
```

**React Native Bridge**:
```typescript
// utils/dynamicColor.ts
import { NativeModules } from 'react-native';

const { DynamicColorModule } = NativeModules;

export const getDynamicColors = async () => {
    if (DynamicColorModule) {
        return await DynamicColorModule.getSystemColors();
    }
    return null;
};
```

---

### 2. Predictive Back Gesture

**Description**: Show preview of previous screen when swiping back.

**Implementation**:
```kotlin
// In MainActivity.kt
import androidx.activity.OnBackPressedCallback

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
            // Animate back gesture
            startBackAnimation()
        }
    })
}

private fun startBackAnimation() {
    // Show preview of previous screen
    window.enterImmersiveMode()
}
```

**Expo Router Integration**:
Already supported via React Navigation v6+. Enable in `app.json`:
```json
{
  "expo": {
    "androidNavigationBar": {
      "visible": "leanback"
    }
  }
}
```

---

### 3. One UI Specific Widgets

**Edge Panel Widget**:
Samsung's Edge Screen feature allows quick access panels.

**File**: `android/app/src/main/java/com/anchor/EdgePanelProvider.java`

```java
package com.anchor;

import com.samsung.android.sdk.look.cocktailbar.SlookCocktailManager;

public class AnchorEdgePanel extends SlookCocktailProvider {
    @Override
    public void onUpdate(Context context, SlookCocktailManager manager, int[] ids) {
        // Show current anchor task in edge panel
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.edge_panel_anchor);
        
        String currentTask = getCurrentTask();
        views.setTextViewText(R.id.task_text, currentTask);
        
        manager.updateCocktail(ids[0], views);
    }
}
```

**Edge Panel Layout**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="8dp"
    android:background="@drawable/edge_panel_bg">
    
    <TextView
        android:id="@+id/task_text"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="14sp"
        android:textColor="#ffffff"
        android:maxLines="1" />
</LinearLayout>
```

---

### 4. Samsung Good Lock Integration

**Routines Integration**:
Allow users to trigger Anchor tasks via Bixby Routines.

**Implementation**:
1. Create custom Routine action
2. Expose Intent filters for task creation
3. Support Routine triggers (time, location, etc.)

**AndroidManifest.xml**:
```xml
<activity android:name=".RoutineActionActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="com.samsung.android.app.routines.action.ACTION_QUICK_TASK" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```

**RoutineActionActivity.java**:
```java
public class RoutineActionActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Intent intent = getIntent();
        String action = intent.getAction();
        
        if ("com.samsung.android.app.routines.action.ACTION_QUICK_TASK".equals(action)) {
            String taskText = intent.getStringExtra("task_text");
            // Add task to Anchor via bridge
            finish();
        }
    }
}
```

---

### 5. One Hand Operation+

**Quick Gestures**:
- Swipe diagonal: Complete current task
- Swipe up from bottom: Open Anchor
- Swipe down: Defer task

**Implementation**:
Register custom gestures in Good Lock settings. No special code required - users configure manually.

---

## Permissions Required

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="com.samsung.android.providers.context.permission.WRITE_USE_APP_FEATURE_SURVEY" />
<uses-permission android:name="com.sec.android.cocktailbar.permission.ACCESS_PANEL" />
```

---

## Testing on One UI 8

### Prerequisites
- Samsung Galaxy device with One UI 8 (Android 16)
- Good Lock installed from Galaxy Store
- Developer options enabled

### Test Checklist
- [ ] Dynamic theming from wallpaper works
- [ ] Predictive back gesture shows preview
- [ ] Edge panel widget displays current task
- [ ] Bixby Routines can create tasks
- [ ] One Hand Operation gestures functional

---

## Build Configuration

**app.json**:
```json
{
  "expo": {
    "android": {
      "package": "com.anchor.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundcolored": "#000000",
        "monochromeImage": "./assets/monochrome-icon.png"
      },
      "enableDangerousExperimentalLeanBuilds": true
    }
  }
}
```

---

## Resources
- [Samsung Developers Portal](https://developer.samsung.com/)
- [One UI SDK](https://developer.samsung.com/one-ui)
- [Good Lock Developer Guide](https://developer.samsung.com/good-lock)
- [Material You Guidelines](https://m3.material.io/styles/color/dynamic-color/overview)
