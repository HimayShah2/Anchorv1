# App Logo Integration Guide

## 📱 Update Launcher Icon

You have a beautiful anchor logo (cyan/blue gradient)! To use it as the app launcher icon:

### Quick Setup

1. **Save your logo image** as `icon.png` (1024x1024 recommended)

2. **Use Expo's icon generator** (easiest method):
   ```powershell
   # Place your logo at: assets/icon.png
   # Then regenerate icons:
   npx expo prebuild --clean
   ```

### Manual Setup (Alternative)

If you prefer manual control, resize your logo to these sizes and place in folders:

**Icon Sizes Needed:**
- `mipmap-mdpi/ic_launcher.png` - 48x48px
- `mipmap-hdpi/ic_launcher.png` - 72x72px
- `mipmap-xhdpi/ic_launcher.png` - 96x96px
- `mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192px

**Round Icon (for Android 8+):**
- Same sizes but named `ic_launcher_round.png`

### Current Status

✅ App name: **Anchor**  
✅ Package: `com.anchor.ironclad`  
✅ Background color: Pure black (#000000)  
✅ Your logo: Cyan/blue gradient anchor with glow

### Adaptive Icon (Android 8+)

The adaptive icon setup is in `app.json`:
```json
"adaptiveIcon": {
  "foregroundImage": "./assets/adaptive-icon.png",
  "backgroundColor": "#000000"
}
```

Place your logo at `assets/adaptive-icon.png` (1024x1024) and it will auto-generate!

---

## 🚀 For Final Build

Once icons are in place:
```powershell
cd android
.\gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Current Launcher Icon Locations

```
android/app/src/main/res/
├── mipmap-hdpi/
│   ├── ic_launcher.png
│   ├── ic_launcher_round.png
│   └── ic_launcher_foreground.png
├── mipmap-mdpi/
├── mipmap-xhdpi/
├── mipmap-xxhdpi/
└── mipmap-xxxhdpi/
```

**Note:** The app is currently using default Expo icons. Replace these with your logo!
