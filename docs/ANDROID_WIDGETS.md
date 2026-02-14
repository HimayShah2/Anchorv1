# Android Widget Implementation Guide

## Overview
This document outlines the requirements and steps to implement Android home screen widgets for the Anchor app. **Note: This requires a native build via `eas build` or Android Studio.**

## Prerequisites
- Expo Development Build configured
- Android Studio installed (optional for local builds)
- EAS CLI installed: `npm install -g eas-cli`

## Implementation Steps

### 1. Update app.json Configuration

Add widget configuration to support native modules:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": true,
            "minSdkVersion": 26,
            "targetSdkVersion": 34,
            "compileSdkVersion": 34
          }
        }
      ]
    ],
    "android": {
      "package": "com.anchor.app",
      "permissions": [
        "VIBRATE",
        "MODIFY_AUDIO_SETTINGS",
        "ACCESS_NOTIFICATION_POLICY"
      ]
    }
  }
}
```

### 2. Create Widget Provider (Java/Kotlin)

**File**: `android/app/src/main/java/com/anchor/widgets/AnchorWidgetProvider.java`

```java
package com.anchor.widgets;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;
import com.anchor.R;

public class AnchorWidgetProvider extends AppWidgetProvider {
    
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
    
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Get current task from AsyncStorage/SharedPreferences
        String currentTask = getCurrentTask(context);
        
        // Create RemoteViews
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_anchor);
        views.setTextViewText(R.id.widget_task_text, currentTask);
        
        // Set up intents for buttons
        // TODO: Add complete/defer button handlers
        
        // Update widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
    
    private static String getCurrentTask(Context context) {
        // Read from SharedPreferences or use expo-secure-store bridge
        return "No active task";
    }
}
```

### 3. Create Widget Layout XML

**File**: `android/app/src/main/res/xml/widget_info.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_anchor"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen">
</appwidget-provider>
```

**File**: `android/app/src/main/res/layout/widget_anchor.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_background">
    
    <TextView
        android:id="@+id/widget_task_text"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Current Task"
        android:textSize="16sp"
        android:textColor="#ffffff"
        android:maxLines="2"
        android:ellipsize="end" />
    
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="8dp">
        
        <Button
            android:id="@+id/widget_complete_btn"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Complete"
            android:backgroundTint="#22d3ee" />
        
        <Button
            android:id="@+id/widget_defer_btn"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="8dp"
            android:text="Defer"
            android:backgroundTint="#facc15" />
    </LinearLayout>
</LinearLayout>
```

### 4. Update AndroidManifest.xml

Add widget receiver declaration:

```xml
<receiver android:name=".widgets.AnchorWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_info" />
</receiver>
```

### 5. Build Native App

```bash
# Install EAS build
eas build:configure

# Build development client
eas build --profile development --platform android

# Or build APK locally
npx expo run:android
```

## Widget Update Strategy

### Update from React Native
Create a native module bridge to update widget from JS:

```typescript
// utils/widgetBridge.ts
import { NativeModules } from 'react-native';

const { AnchorWidget } = NativeModules;

export const updateWidget = (task: string) => {
    if (AnchorWidget) {
        AnchorWidget.updateCurrentTask(task);
    }
};
```

### Automatic Updates
- Widget updates every 30 minutes automatically
- Manual update when task changes (via native module)
- Broadcast receiver for instant updates

## Testing
1. Build development client
2. Install on Android device
3. Long-press home screen → Widgets
4. Add "Anchor" widget
5. Verify task display
6. Test Complete/Defer buttons

## Resources
- [Android App Widgets Guide](https://developer.android.com/develop/ui/views/appwidgets)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
