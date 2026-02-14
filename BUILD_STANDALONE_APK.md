# Building Standalone APK (No Metro Required)

## ❌ Problem with Previous Build

The APK built with `gradlew assembleDebug` was a **development build** that needs Metro bundler running. It doesn't have the JavaScript code embedded.

---

## ✅ Solution: Build Standalone APK

### Option 1: Expo Run (Recommended - Building Now)

```powershell
npx expo run:android --variant release --no-build-cache
```

**This will:**
- Bundle JavaScript code into the APK
- Create a standalone APK that works without Metro
- Install it on your phone automatically

**APK Location:** `android\app\build\outputs\apk\release\app-release.apk`

---

### Option 2: Manual Gradle Release Build

If Option 1 fails, try this:

```powershell
cd android
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
.\gradlew assembleRelease
```

**Note:** This requires a signing key. If you don't have one, use the debug build with bundled JS:

```powershell
# Bundle JS first
npx expo export:embed

# Then build
cd android
.\gradlew assembleDebug
```

---

### Option 3: Create Debug Build with Metro

If you want to test with Metro (development mode):

**Terminal 1:** Start Metro
```powershell
npx expo start
```

**Terminal 2:** Install APK
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

**Then** on your phone, make sure you're on the same WiFi network and the app will connect to Metro.

---

## 🎯 Current Status

Running: `npx expo run:android --variant release`

This will create a **standalone APK** with all JavaScript bundled inside. Once complete, the app will work without any dev server!

---

## 📱 After Build Completes

The release APK will be at:
```
android\app\build\outputs\apk\release\app-release.apk
```

**Install it:**
```powershell
adb install android\app\build\outputs\apk\release\app-release.apk
```

This APK will work completely standalone - no Metro needed!
