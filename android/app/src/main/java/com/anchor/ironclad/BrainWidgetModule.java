package com.anchor.ironclad;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.facebook.react.bridge.*;

public class BrainWidgetModule extends ReactContextBaseJavaModule {
    private static final String PREFS_NAME = "BrainWidgetPrefs";
    
    public BrainWidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BrainWidgetModule";
    }

    @ReactMethod
    public void updateWidget(String title, String content, int noteCount) {
        Context context = getReactApplicationContext();
        
        // Save to preferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putString("note_title", title)
            .putString("note_content", content)
            .putInt("note_count", noteCount)
            .apply();
        
        // Trigger widget update
        Intent intent = new Intent(context, BrainWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context)
            .getAppWidgetIds(new ComponentName(context, BrainWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);
    }

    @ReactMethod
    public void clearWidget() {
        updateWidget("No notes yet", "Add notes in Second Brain", 0);
    }
}
