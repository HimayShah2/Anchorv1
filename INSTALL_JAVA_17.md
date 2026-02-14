# ⚠️ WRONG JAVA VERSION DETECTED

You currently have **Java 25** installed, but React Native requires **Java 17**.

## Quick Fix:

### 1. Download Java 17

**Direct Download Link:**
https://adoptium.net/temurin/releases/?version=17

**Select:**
- Version: **17 - LTS** (NOT 21 or 25!)
- Operating System: Windows
- Architecture: x64
- Package Type: JDK
- Download: `.msi` installer

### 2. Install Java 17

1. Run the downloaded `.msi` file
2. Default installation path: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`
3. Complete installation

### 3. Set JAVA_HOME to Java 17

**In PowerShell:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13-hotspot"
java -version
```

**Expected output:**
```
openjdk version "17.0.13"
```

### 4. Build APK

```powershell
cd "C:\Users\himay\New folder (3)\Anchor\android"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13-hotspot"
.\gradlew assembleDebug
```

---

## Why Java 17?

React Native and Android Gradle Plugin require Java 17 LTS. Java 25 is too new and incompatible.

---

## After Installing Java 17:

The build will work immediately. The APK will be ready in 5-10 minutes at:
`android\app\build\outputs\apk\debug\app-debug.apk`
