package com.anchor.ironclad;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.content.Intent;
import android.provider.Settings;

/**
 * React Native module for Do Not Disturb control
 */
public class DNDModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "DNDModule";
    private NotificationManager notificationManager;

    DNDModule(ReactApplicationContext context) {
        super(context);
        notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void checkDNDPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            boolean hasPermission = notificationManager.isNotificationPolicyAccessGranted();
            promise.resolve(hasPermission);
        } else {
            promise.resolve(true); // No permission needed on older Android
        }
    }

    @ReactMethod
    public void requestDNDPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!notificationManager.isNotificationPolicyAccessGranted()) {
                Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
            }
        }
    }

    @ReactMethod
    public void enableDND(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (notificationManager.isNotificationPolicyAccessGranted()) {
                    // Set DND mode to Priority (suppresses most notifications)
                    notificationManager.setInterruptionFilter(
                        NotificationManager.INTERRUPTION_FILTER_PRIORITY
                    );
                    promise.resolve(true);
                } else {
                    promise.reject("NO_PERMISSION", "DND permission not granted");
                }
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void disableDND(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (notificationManager.isNotificationPolicyAccessGranted()) {
                    // Restore normal interruption filter
                    notificationManager.setInterruptionFilter(
                        NotificationManager.INTERRUPTION_FILTER_ALL
                    );
                    promise.resolve(true);
                } else {
                    promise.reject("NO_PERMISSION", "DND permission not granted");
                }
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isDNDEnabled(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int filter = notificationManager.getCurrentInterruptionFilter();
            promise.resolve(filter != NotificationManager.INTERRUPTION_FILTER_ALL);
        } else {
            promise.resolve(false);
        }
    }
}
