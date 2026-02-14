package com.anchor.ironclad;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.content.Intent;
import android.content.ComponentName;
import android.os.Build;

/**
 * React Native module for Samsung One UI 8 Now Bar integration
 * Displays current task on Samsung lock screen
 */
public class NowBarModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "NowBarModule";
    private static final String NOW_BAR_PACKAGE = "com.samsung.android.app.nowbar";
    private static final String NOW_BAR_ACTION = "com.samsung.android.app.nowbar.ACTION_UPDATE";

    NowBarModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void checkNowBarAvailable(Promise promise) {
        // Check if device is Samsung with One UI 8+
        boolean isSamsung = Build.MANUFACTURER.equalsIgnoreCase("samsung");
        boolean isAndroid14Plus = Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE; // Android 14+
        
        promise.resolve(isSamsung && isAndroid14Plus);
    }

    @ReactMethod
    public void updateNowBar(String taskText, double timeRemainingMs, Promise promise) {
        try {
            ReactApplicationContext context = getReactApplicationContext();
            
            // Create intent to update Now Bar
            Intent intent = new Intent(NOW_BAR_ACTION);
            intent.setPackage(NOW_BAR_PACKAGE);
            
            // Add task information
            intent.putExtra("app_name", "Anchor");
            intent.putExtra("title", "Current Task");
            intent.putExtra("content", taskText);
            intent.putExtra("timestamp", System.currentTimeMillis());
            
            // Add time remaining if available
            if (timeRemainingMs > 0) {
                int minutes = (int) (timeRemainingMs / 60000);
                int seconds = (int) ((timeRemainingMs % 60000) / 1000);
                String timeText = String.format("%dm %02ds", minutes, seconds);
                intent.putExtra("subtitle", timeText + " remaining");
            }
            
            // Send broadcast to Now Bar
            context.sendBroadcast(intent);
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to update Now Bar: " + e.getMessage());
        }
    }

    @ReactMethod
    public void clearNowBar(Promise promise) {
        try {
            ReactApplicationContext context = getReactApplicationContext();
            
            // Create intent to clear Now Bar
            Intent intent = new Intent(NOW_BAR_ACTION);
            intent.setPackage(NOW_BAR_PACKAGE);
            intent.putExtra("app_name", "Anchor");
            intent.putExtra("action", "clear");
            
            context.sendBroadcast(intent);
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to clear Now Bar: " + e.getMessage());
        }
    }

    @ReactMethod
    public void setNowBarClickAction(Promise promise) {
        try {
            ReactApplicationContext context = getReactApplicationContext();
            
            // Create intent that opens app when Now Bar item is tapped
            Intent intent = new Intent(NOW_BAR_ACTION);
            intent.setPackage(NOW_BAR_PACKAGE);
            intent.putExtra("app_name", "Anchor");
            
            // Set pending intent to open app
            Intent openAppIntent = new Intent(context, MainActivity.class);
            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            
            intent.putExtra("click_action", "open_app");
            intent.putExtra("package_name", context.getPackageName());
            
            context.sendBroadcast(intent);
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to set Now Bar click action: " + e.getMessage());
        }
    }
}
