package com.anchor.ironclad;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.app.PendingIntent;

public class BrainWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "BrainWidgetPrefs";
    private static final String KEY_NOTE_TITLE = "note_title";
    private static final String KEY_NOTE_CONTENT = "note_content";
    private static final String KEY_NOTE_COUNT = "note_count";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_brain);
            
            // Get note data
            String noteTitle = prefs.getString(KEY_NOTE_TITLE, "No notes yet");
            String noteContent = prefs.getString(KEY_NOTE_CONTENT, "Add notes in Second Brain");
            int noteCount = prefs.getInt(KEY_NOTE_COUNT, 0);
            
            // Set text
            views.setTextViewText(R.id.widget_brain_title, noteTitle);
            views.setTextViewText(R.id.widget_brain_content, noteContent);
            views.setTextViewText(R.id.widget_brain_count, noteCount + " notes");
            
            // Click to open app
            Intent intent = new Intent(context, MainActivity.class);
            intent.putExtra("openBrain", true);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_brain_container, pendingIntent);
            
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }
}
