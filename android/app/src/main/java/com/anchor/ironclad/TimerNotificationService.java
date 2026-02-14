package com.anchor.ironclad;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.Handler;
import android.os.Looper;
import androidx.core.app.NotificationCompat;

/**
 * Foreground service to display persistent timer notification
 * Updates every second with remaining time
 */
public class TimerNotificationService extends Service {
    
    private static final String CHANNEL_ID = "anchor_timer_channel";
    private static final int NOTIFICATION_ID = 1001;
    
    private Handler updateHandler;
    private Runnable updateRunnable;
    private long endTimeMillis;
    private String taskText;
    private NotificationManager notificationManager;
    
    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        updateHandler = new Handler(Looper.getMainLooper());
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }
        
        taskText = intent.getStringExtra("taskText");
        long durationMinutes = intent.getLongExtra("durationMinutes", 25);
        endTimeMillis = System.currentTimeMillis() + (durationMinutes * 60 * 1000);
        
        // Start foreground service with initial notification
        startForeground(NOTIFICATION_ID, buildNotification());
        
        // Start updating notification every second
        startTimerUpdates();
        
        return START_STICKY;
    }
    
    private void startTimerUpdates() {
        updateRunnable = new Runnable() {
            @Override
            public void run() {
                long remaining = endTimeMillis - System.currentTimeMillis();
                
                if (remaining <= 0) {
                    // Timer complete
                    showCompletionNotification();
                    stopSelf();
                } else {
                    // Update notification
                    notificationManager.notify(NOTIFICATION_ID, buildNotification());
                    // Schedule next update in 1 second
                    updateHandler.postDelayed(this, 1000);
                }
            }
        };
        updateHandler.post(updateRunnable);
    }
    
    private Notification buildNotification() {
        long remaining = endTimeMillis - System.currentTimeMillis();
        String timeText = formatTime(remaining);
        
        // Intent to open app when notification is tapped
        Intent openAppIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            openAppIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        
        // Complete button action
        Intent completeIntent = new Intent(this, NotificationActionReceiver.class);
        completeIntent.setAction("COMPLETE_TASK");
        PendingIntent completePendingIntent = PendingIntent.getBroadcast(
            this, 
            0, 
            completeIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        
        // Defer button action
        Intent deferIntent = new Intent(this, NotificationActionReceiver.class);
        deferIntent.setAction("DEFER_TASK");
        PendingIntent deferPendingIntent = PendingIntent.getBroadcast(
            this, 
            1, 
            deferIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("⏱️ " + (taskText != null ? taskText : "Task in Progress"))
                .setContentText(timeText + " remaining")
                .setSmallIcon(R.drawable.ic_notification)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .addAction(R.drawable.ic_check, "Complete", completePendingIntent)
                .addAction(R.drawable.ic_defer, "Defer", deferPendingIntent)
                .setStyle(new NotificationCompat.BigTextStyle()
                    .bigText((taskText != null ? taskText : "Task in Progress") + "\n" + timeText + " remaining"))
                .build();
    }
    
    private void showCompletionNotification() {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 
            0, 
            openAppIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        
        Notification completionNotif = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("✅ Task Time Complete!")
                .setContentText(taskText != null ? taskText : "Well done!")
                .setSmallIcon(R.drawable.ic_notification)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .build();
        
        notificationManager.notify(NOTIFICATION_ID + 1, completionNotif);
    }
    
    private String formatTime(long milliseconds) {
        int totalSeconds = (int) (milliseconds / 1000);
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        
        if (minutes >= 60) {
            int hours = minutes / 60;
            int mins = minutes % 60;
            return String.format("%dh %02dm", hours, mins);
        }
        
        return String.format("%dm %02ds", minutes, seconds);
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Timer Notifications",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Shows current task timer with remaining time");
            channel.setShowBadge(true);
            channel.enableLights(true);
            channel.enableVibration(false); // No vibration for timer updates
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
    
    @Override
    public void onDestroy() {
        if (updateHandler != null && updateRunnable != null) {
            updateHandler.removeCallbacks(updateRunnable);
        }
        super.onDestroy();
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
