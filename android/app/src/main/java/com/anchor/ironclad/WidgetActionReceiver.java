package com.anchor.ironclad;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

/**
 * Handles widget button actions
 */
public class WidgetActionReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        
        if ("WIDGET_COMPLETE_TASK".equals(action)) {
            // Open app and trigger complete
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.putExtra("action", "COMPLETE_TASK");
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(launchIntent);
            
            Toast.makeText(context, "Task completed! 🎯", Toast.LENGTH_SHORT).show();
            
        } else if ("WIDGET_DEFER_TASK".equals(action)) {
            // Open app and trigger defer
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.putExtra("action", "DEFER_TASK");
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(launchIntent);
            
            Toast.makeText(context, "Task deferred", Toast.LENGTH_SHORT).show();
        }
    }
}
