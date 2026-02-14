package com.anchor.ironclad;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Intent;
import android.os.Build;

/**
 * React Native module bridge for timer notifications
 */
public class TimerModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "TimerModule";

    TimerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startTimer(String taskText, double durationMinutes) {
        Intent serviceIntent = new Intent(getReactApplicationContext(), TimerNotificationService.class);
        serviceIntent.putExtra("taskText", taskText);
        serviceIntent.putExtra("durationMinutes", (long) durationMinutes);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getReactApplicationContext().startForegroundService(serviceIntent);
        } else {
            getReactApplicationContext().startService(serviceIntent);
        }
    }

    @ReactMethod
    public void stopTimer() {
        Intent serviceIntent = new Intent(getReactApplicationContext(), TimerNotificationService.class);
        getReactApplicationContext().stopService(serviceIntent);
    }
}
