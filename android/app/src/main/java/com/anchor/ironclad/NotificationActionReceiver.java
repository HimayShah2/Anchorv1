package com.anchor.ironclad;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

/**
 * Receives notification button actions (Complete/Defer)
 */
public class NotificationActionReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        
        if ("COMPLETE_TASK".equals(action)) {
            // Stop timer service
            Intent stopIntent = new Intent(context, TimerNotificationService.class);
            context.stopService(stopIntent);
            
            // Send event to React Native
            sendEventToReactNative(context, "TASK_COMPLETED");
            
            Toast.makeText(context, "Task completed! 🎯", Toast.LENGTH_SHORT).show();
            
        } else if ("DEFER_TASK".equals(action)) {
            // Stop timer service
            Intent stopIntent = new Intent(context, TimerNotificationService.class);
            context.stopService(stopIntent);
            
            // Send event to React Native
            sendEventToReactNative(context, "TASK_DEFERRED");
            
            Toast.makeText(context, "Task deferred", Toast.LENGTH_SHORT).show();
        }
    }
    
    private void sendEventToReactNative(Context context, String eventName) {
        // This will be handled by a React Native module bridge
        // For now, we'll open the app
        Intent launchIntent = context.getPackageManager()
                .getLaunchIntentForPackage(context.getPackageName());
        if (launchIntent != null) {
            launchIntent.putExtra("action", eventName);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(launchIntent);
        }
    }
}
