# Build APK with Android Studio - Complete Guide

## Prerequisites

1. **Install Android Studio**: Download from https://developer.android.com/studio
2. **Install Node.js**: Already have this
3. **Install JDK 17**: Android Studio includes this

---

## Step 1: Generate Native Android Folder

Run this command in your project directory:

```bash
npx expo prebuild --clean
```

This creates the `android/` folder with native code.

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Open Project in Android Studio

1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to: `c:\Users\himay\New folder (3)\Anchor\android`
4. Click "OK"

Wait for Gradle sync to complete (5-10 minutes first time).

---

## Step 4: Configure Build

### A. Update gradle.properties

Add these lines to `android/gradle.properties`:

```properties
# Enable ProGuard
android.enableProguardInReleaseBuilds=true

# Increase memory
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m

# Samsung One UI optimizations
android.enableR8.fullMode=true
```

### B. Update build.gradle (app level)

File: `android/app/build.gradle`

Add Material 3 support:

```gradle
dependencies {
    // ... existing dependencies
    
    // Material You / Material 3
    implementation 'com.google.android.material:material:1.11.0'
    
    // Samsung SDK (optional)
    implementation 'com.samsung.android:camera-sdk:1.0.0'
}
```

---

## Step 5: Build APK

### Option A: Using Android Studio GUI

1. In Android Studio, click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete (~5 minutes)
3. Click "locate" in the notification
4. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Using Command Line

```bash
cd android
.\gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### For Release Build:

```bash
cd android
.\gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Step 6: Sign APK (Release Only)

### Generate Keystore

```bash
keytool -genkeypair -v -keystore anchor-release.keystore -alias anchor -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing

Add to `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('anchor-release.keystore')
            storePassword 'your-password'
            keyAlias 'anchor'
            keyPassword 'your-password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## Step 7: Install APK on Device

### Via USB:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Via File Transfer:

1. Copy APK to phone
2. Open file manager
3. Tap APK
4. Allow "Install unknown apps" permission
5. Install

---

## Step 8: Enable One UI 8 Features

After generating the android folder, you need to add native code.

### Material You Dynamic Colors

File: `android/app/src/main/java/com/anchor/ironclad/MainActivity.java`

Add this method:

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    // Enable Material You (Android 12+)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        // Dynamic colors enabled
        setTheme(com.google.android.material.R.style.Theme_Material3_DynamicColors_DayNight);
    }
    super.onCreate(savedInstanceState);
}
```

### Notification Service with Timer

File: `android/app/src/main/java/com/anchor/ironclad/TimerNotificationService.java`

```java
package com.anchor.ironclad;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import java.util.Timer;
import java.util.TimerTask;

public class TimerNotificationService extends Service {
    private static final String CHANNEL_ID = "timer_channel";
    private static final int NOTIFICATION_ID = 1;
    private Timer updateTimer;
    private long endTime;
    private String taskText;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        taskText = intent.getStringExtra("taskText");
        long duration = intent.getLongExtra("duration", 0);
        endTime = System.currentTimeMillis() + duration;

        startForeground(NOTIFICATION_ID, buildNotification());
        startTimerUpdates();

        return START_STICKY;
    }

    private void startTimerUpdates() {
        updateTimer = new Timer();
        updateTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                long remaining = endTime - System.currentTimeMillis();
                if (remaining <= 0) {
                    stopSelf();
                } else {
                    updateNotification();
                }
            }
        }, 0, 1000); // Update every second
    }

    private Notification buildNotification() {
        long remaining = endTime - System.currentTimeMillis();
        String timeText = formatTime(remaining);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("⏱️ " + taskText)
                .setContentText(timeText + " remaining")
                .setSmallIcon(R.drawable.ic_notification)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();
    }

    private void updateNotification() {
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.notify(NOTIFICATION_ID, buildNotification());
    }

    private String formatTime(long ms) {
        int totalSeconds = (int) (ms / 1000);
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        return String.format("%dm %02ds", minutes, seconds);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Timer Notifications",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
        if (updateTimer != null) {
            updateTimer.cancel();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
```

Add to `AndroidManifest.xml`:

```xml
<application>
    <!-- ... existing code ... -->
    
    <service
        android:name=".TimerNotificationService"
        android:enabled="true"
        android:exported="false"
        android:foregroundServiceType="dataSync" />
</application>
```

---

## Step 9: Test on Device

1. Install APK
2. Open app
3. Start a task
4. Pull down notification shade
5. Verify timer updates every second

---

## Troubleshooting

### Build Fails - "SDK not found"

1. Open Android Studio
2. Tools → SDK Manager
3. Install Android SDK Platform 34

### Gradle Sync Fails

```bash
cd android
.\gradlew clean
.\gradlew assembleDebug --stacktrace
```

### APK Install Fails

Enable "Install from unknown sources" in device settings.

### App Crashes on Launch

Check logcat:

```bash
adb logcat | grep Anchor
```

---

## File Locations After Build

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB (Play Store)**: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Next Steps

1. **Test APK** on your device
2. **Add notification icon**: Place `ic_notification.png` in `android/app/src/main/res/drawable/`
3. **Customize theme**: Edit `android/app/src/main/res/values/styles.xml`
4. **Add widgets**: Follow `docs/ANDROID_WIDGETS.md`

---

## One-Line Build Command

After setup, just run:

```bash
npx expo prebuild --clean && cd android && .\gradlew assembleDebug && cd ..
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`
