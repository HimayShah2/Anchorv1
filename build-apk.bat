@echo off
REM Set JAVA_HOME to Java 17 (NOT Java 25!)
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.13-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Verify Java
echo Checking Java version...
java -version
if errorlevel 1 (
    echo ERROR: Java not found!
    echo Please install Java 17 from https://adoptium.net/temurin/releases/
    pause
    exit /b 1
)

echo.
echo Building APK...
cd android
gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo BUILD FAILED!
    echo Check errors above for details.
    pause
    exit /b 1
)

echo.
echo ============================================
echo BUILD SUCCESSFUL!
echo ============================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
