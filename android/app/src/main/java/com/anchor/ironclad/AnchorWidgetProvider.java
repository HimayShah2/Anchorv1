package com.anchor.ironclad;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Home screen widget showing current anchor task
 */
public class AnchorWidgetProvider extends AppWidgetProvider {
    
    private static final String PREFS_NAME = "anchor_widget_prefs";
    private static final String PREF_CURRENT_TASK = "current_task";
    
    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
    
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Get current task from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String currentTask = prefs.getString(PREF_CURRENT_TASK, "No active task");
        
        // Create RemoteViews
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_anchor);
        
        // Set task text
        views.setTextViewText(R.id.widget_task_text, currentTask);
        
        // Set up click intents
        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent openPendingIntent = PendingIntent.getActivity(
            context, 
            0, 
            openAppIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_container, openPendingIntent);
        
        // Complete button
        Intent completeIntent = new Intent(context, WidgetActionReceiver.class);
        completeIntent.setAction("WIDGET_COMPLETE_TASK");
        PendingIntent completePendingIntent = PendingIntent.getBroadcast(
            context, 
            0, 
            completeIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_complete_btn, completePendingIntent);
        
        // Defer button
        Intent deferIntent = new Intent(context, WidgetActionReceiver.class);
        deferIntent.setAction("WIDGET_DEFER_TASK");
        PendingIntent deferPendingIntent = PendingIntent.getBroadcast(
            context, 
            1, 
            deferIntent, 
            PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_defer_btn, deferPendingIntent);
        
        // Update widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
    
    /**
     * Update widget from React Native
     */
    public static void updateWidgetTask(Context context, String taskText) {
        // Save to SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(PREF_CURRENT_TASK, taskText).apply();
        
        // Update all widgets
        Intent intent = new Intent(context, AnchorWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        context.sendBroadcast(intent);
    }
}
